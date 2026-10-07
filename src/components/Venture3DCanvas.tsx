import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Compass,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Hand,
  Rotate3d,
  X,
  Share2,
  ChevronRight,
  Sparkles,
  IndianRupee,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  FastForward,
  ChevronUp,
  ChevronDown,
  Scale,
} from "lucide-react";
import { Button } from "./ui/button";
import type {
  InteractiveMapData,
  InteractiveMapPlot,
  InteractiveMapAmenity,
} from "../types/interactiveMap";
import { getMapAssetUrl } from "../siteConfig";

type VentureInteractiveMapData = InteractiveMapData;
type VentureInteractiveMapPlot = InteractiveMapPlot;
type VentureAmenityPin = InteractiveMapAmenity;

export type PropertyDetails = Partial<InteractiveMapPlot> & {
  possible_redzone?: boolean;
  is_redzone?: number;
  redzone_status?: string;
  redzone_reason?: string;
  redzone_ondate?: string;
  total_paid?: number;
  srq_feets?: number | string;
  srq_yards?: number | string;
  width?: number;
  length?: number;
};

interface DroneWaypoint {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  category?: string;
  cameraPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  iconImage?: string | null;
  iconSymbol?: string;
  color?: string;
}

const AMENITY_ICONS: Record<string, string> = {
  Building2: "🏢",
  Waves: "🏊",
  Trees: "🌳",
  Landmark: "⛩️",
  ShieldCheck: "🛡️",
  Gamepad2: "🛝",
  Footprints: "🏃",
  Dumbbell: "🏋️",
  Sparkles: "✨",
  Store: "🏬",
  Zap: "⚡",
  Droplets: "💧",
};

function getFullAssetUrl(url: string | null | undefined): string | null {
  return getMapAssetUrl(url) || null;
}

function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function isValidCost(cost: any): boolean {
  if (cost === undefined || cost === null) return false;
  const num = Number(cost);
  return !isNaN(num) && num > 0;
}

interface Venture3DCanvasProps {
  mapData: VentureInteractiveMapData;
  selectedPlot: VentureInteractiveMapPlot | null;
  plotDetails: PropertyDetails | null;
  detailsLoading: boolean;
  onSelectPlot: (plot: VentureInteractiveMapPlot) => void;
  onClosePlot: () => void;
  onBookSiteVisit: (plot: VentureInteractiveMapPlot) => void;
  onBookPlot: (plot: VentureInteractiveMapPlot) => void;
  onWhatsAppShare: (plot: VentureInteractiveMapPlot) => void;
  onSelectAmenity?: (amenity: VentureAmenityPin) => void;
  isPlotMatching: (plot: VentureInteractiveMapPlot) => boolean;
  isAnyFilterActive?: boolean;
  statusColors: Record<string, string>;
  comparedPlotIds?: number[];
  onToggleCompare?: (plot: VentureInteractiveMapPlot) => void;
}

export default function Venture3DCanvas({
  mapData,
  selectedPlot,
  plotDetails,
  detailsLoading,
  onSelectPlot,
  onClosePlot,
  onBookSiteVisit,
  onBookPlot,
  onWhatsAppShare,
  onSelectAmenity,
  isPlotMatching,
  isAnyFilterActive = false,
  statusColors,
  comparedPlotIds = [],
  onToggleCompare,
}: Venture3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Stable references to prevent scene recreation on parent re-renders
  const onSelectPlotRef = useRef(onSelectPlot);
  onSelectPlotRef.current = onSelectPlot;

  const statusColorsRef = useRef(statusColors);
  statusColorsRef.current = statusColors;

  const selectedPlotRef = useRef(selectedPlot);
  selectedPlotRef.current = selectedPlot;

  const isPlotMatchingRef = useRef(isPlotMatching);
  isPlotMatchingRef.current = isPlotMatching;

  const isAnyFilterActiveRef = useRef(isAnyFilterActive);
  isAnyFilterActiveRef.current = isAnyFilterActive;

  // Mesh registries for interaction
  const plotMeshesMapRef = useRef<
    Map<string, { mesh: THREE.Mesh; plot: VentureInteractiveMapPlot; defaultMat: THREE.Material }>
  >(new Map());
  const amenityMeshesMapRef = useRef<
    Map<
      string,
      {
        group: THREE.Group;
        mesh: THREE.Mesh;
        pulseRing: THREE.Mesh;
        amenity: VentureAmenityPin;
      }
    >
  >(new Map());

  const hoveredPlotRef = useRef<VentureInteractiveMapPlot | null>(null);
  const [hoveredPlotState, setHoveredPlotState] = useState<VentureInteractiveMapPlot | null>(null);
  const isMouseOverCardRef = useRef(false);
  const hoveredAmenityRef = useRef<VentureAmenityPin | null>(null);
  const [hoveredAmenityState, setHoveredAmenityState] = useState<VentureAmenityPin | null>(null);
  const [selectedAmenityModal, setSelectedAmenityModal] = useState<VentureAmenityPin | null>(null);
  const [showAmenities, setShowAmenities] = useState<boolean>(true);

  const [cameraAngle, setCameraAngle] = useState(0); // For compass
  const [dragMode, setDragMode] = useState<"orbit" | "pan">("orbit");
  const [activePreset, setActivePreset] = useState<"top" | "iso" | "ground">("iso");

  // Real-time 3D to 2D Screen Position for Speech Bubble Callout
  const [calloutScreenPos, setCalloutScreenPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  // Real-time 3D to 2D Screen Position for Amenity Hover Card
  const [amenityHoverPos, setAmenityHoverPos] = useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  // Cached screen positions & timestamps to eliminate redundant React state updates in animate()
  const lastCalloutPosRef = useRef<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const lastAmenityPosRef = useRef<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });
  const lastAngleUpdateRef = useRef<number>(0);

  // Animation frame tracker for camera fly-to lerp
  const flyAnimRef = useRef<number | null>(null);

  // 3D Master Plan Ground Dimensions Ref for Accurate Flight Path Coordinates
  const planeDimensionsRef = useRef<{ width: number; height: number }>({ width: 700, height: 700 });

  // 🚁 Auto-Pilot Drone / Cinematic Guided Tour State
  const [isDroneTourActive, setIsDroneTourActive] = useState(false);
  const [isDronePaused, setIsDronePaused] = useState(false);
  const [droneWaypointIdx, setDroneWaypointIdx] = useState(0);
  const [droneSpeed, setDroneSpeed] = useState<1 | 1.5 | 2>(1);
  const [droneWaypoints, setDroneWaypoints] = useState<DroneWaypoint[]>([]);
  const [flightProgress, setFlightProgress] = useState(0);
  const [showWaypointDrawer, setShowWaypointDrawer] = useState(false);
  const [droneTelemetry, setDroneTelemetry] = useState<{ altitude: number; angle: number }>({
    altitude: 480,
    angle: 0,
  });

  const droneTourStateRef = useRef<{
    active: boolean;
    paused: boolean;
    currentIdx: number;
    speed: number;
    startTime: number;
    phase: "flying" | "hovering";
    phaseStartTime: number;
    waypoints: DroneWaypoint[];
  }>({
    active: false,
    paused: false,
    currentIdx: 0,
    speed: 1,
    startTime: 0,
    phase: "flying",
    phaseStartTime: 0,
    waypoints: [],
  });

  const flightTrackRef = useRef<{
    prevIdx: number;
    startCamPos: THREE.Vector3;
    startTargetPos: THREE.Vector3;
  }>({
    prevIdx: -1,
    startCamPos: new THREE.Vector3(0, 480, 480),
    startTargetPos: new THREE.Vector3(0, 0, 0),
  });

  const cameraAngleRef = useRef(0);
  const lastAngleStateRef = useRef(0);
  const lastTelemetryUpdateRef = useRef(0);
  const lastProgressUpdateRef = useRef(-1);

  const { map, plots = [], amenities = [] } = mapData;
  const plotsRef = useRef(plots);
  plotsRef.current = plots;
  const amenitiesRef = useRef(amenities);
  amenitiesRef.current = amenities;

  // Configure OrbitControls mouse/touch buttons based on active drag mode
  const applyControlModes = useCallback((controls: OrbitControls, mode: "orbit" | "pan") => {
    if (mode === "orbit") {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    } else {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      };
      controls.touches = {
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      };
    }
  }, []);

  const handleSetDragMode = useCallback(
    (mode: "orbit" | "pan") => {
      setDragMode(mode);
      if (controlsRef.current) {
        applyControlModes(controlsRef.current, mode);
      }
    },
    [applyControlModes]
  );

  // Initialize Three.js Scene ONCE on mount
  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    // 2. Camera (Standard Y-Up)
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.position.set(0, 480, 480);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 40;
    controls.maxDistance = 3000;
    controls.target.set(0, 0, 0);

    applyControlModes(controls, dragMode);
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.7);
    scene.add(hemisphereLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    sunLight.position.set(300, 600, 400);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 50;
    sunLight.shadow.camera.far = 2000;
    const d = 700;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // 6. Master Plan Ground Plane & Base Slab on XZ Plane
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    textureLoader.load(
      map.image_url,
      (texture) => {
        if (!sceneRef.current) return;
        const img = texture.image;
        const imgWidth = img.naturalWidth || img.width || 2048;
        const imgHeight = img.naturalHeight || img.height || 2048;

        const maxDim = 720;
        let planeWidth = maxDim;
        let planeHeight = maxDim;

        if (imgWidth >= imgHeight) {
          planeHeight = (imgHeight / imgWidth) * maxDim;
        } else {
          planeWidth = (imgWidth / imgHeight) * maxDim;
        }

        planeDimensionsRef.current = { width: planeWidth, height: planeHeight };

        // Ground Masterplan Surface
        const planeGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        planeGeo.rotateX(-Math.PI / 2);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = maxAnisotropy;
        texture.needsUpdate = true;
        const planeMat = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide,
          depthWrite: true,
        });
        const groundMesh = new THREE.Mesh(planeGeo, planeMat);
        groundMesh.position.set(0, 0.5, 0);
        scene.add(groundMesh);

        // 3D Base Slab
        const slabThickness = 14;
        const slabGeo = new THREE.BoxGeometry(planeWidth + 24, slabThickness, planeHeight + 24);
        const slabMat = new THREE.MeshStandardMaterial({
          color: 0xe2e8f0,
          roughness: 0.8,
          metalness: 0.05,
        });
        const slabMesh = new THREE.Mesh(slabGeo, slabMat);
        slabMesh.position.set(0, -slabThickness / 2, 0);
        slabMesh.receiveShadow = true;
        slabMesh.castShadow = true;
        scene.add(slabMesh);

        // Build 3D Extruded Plot Blocks with 512x512 High-DPI Canvas Textures
        plotMeshesMapRef.current.clear();
        const basePlotHeight = 9;

        plotsRef.current.forEach((plot) => {
          const posX = (plot.x_percent / 100 - 0.5) * planeWidth;
          const posZ = (plot.y_percent / 100 - 0.5) * planeHeight;

          const plotW = Math.max((plot.width_px ? (plot.width_px / imgWidth) * planeWidth : 22), 16);
          const plotD = Math.max((plot.height_px ? (plot.height_px / imgHeight) * planeHeight : 14), 11);

          // 512x512 High-DPI Canvas for Razor Sharp Numbers
          const canvas = document.createElement("canvas");
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext("2d");
          const bgHex = plot.custom_color || statusColorsRef.current[plot.status] || "#10b981";

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Background fill
            ctx.fillStyle = bgHex;
            ctx.fillRect(0, 0, 512, 512);

            // Subtle top 3D highlight & bevel gradient
            const grad = ctx.createLinearGradient(0, 0, 0, 512);
            grad.addColorStop(0, "rgba(255,255,255,0.45)");
            grad.addColorStop(0.35, "rgba(255,255,255,0.08)");
            grad.addColorStop(1, "rgba(0,0,0,0.32)");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 512, 512);

            // Border stroke
            ctx.lineWidth = 14;
            ctx.strokeStyle = "rgba(255,255,255,0.92)";
            ctx.strokeRect(8, 8, 496, 496);

            // Crisp Bold Plot Number Text
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const text = String(plot.plot_no);
            const fontSize = text.length > 3 ? 124 : text.length > 2 ? 154 : 180;
            ctx.font = `900 ${fontSize}px Inter, system-ui, -apple-system, sans-serif`;
            ctx.shadowColor = "rgba(0,0,0,0.85)";
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 6;
            ctx.fillText(text, 256, 256);
          }

          const plotTexture = new THREE.CanvasTexture(canvas);
          plotTexture.colorSpace = THREE.SRGBColorSpace;
          plotTexture.generateMipmaps = true;
          plotTexture.minFilter = THREE.LinearMipmapLinearFilter;
          plotTexture.magFilter = THREE.LinearFilter;
          plotTexture.anisotropy = maxAnisotropy;

          const sideMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(bgHex).multiplyScalar(0.85),
            roughness: 0.3,
            metalness: 0.1,
            transparent: true,
            opacity: 1.0,
            depthWrite: true,
          });

          const topMat = new THREE.MeshStandardMaterial({
            map: plotTexture,
            roughness: 0.25,
            metalness: 0.15,
            transparent: true,
            opacity: 1.0,
            depthWrite: true,
          });

          const materials = [
            sideMat, // +X
            sideMat, // -X
            topMat, // +Y (Top number face)
            sideMat, // -Y
            sideMat, // +Z
            sideMat, // -Z
          ];

          const plotGeo = new THREE.BoxGeometry(plotW, basePlotHeight, plotD);
          const plotMesh = new THREE.Mesh(plotGeo, materials);
          plotMesh.position.set(posX, basePlotHeight / 2 + 0.6, posZ);
          plotMesh.rotation.y = -((plot.rotation || 0) * Math.PI) / 180;
          plotMesh.castShadow = true;
          plotMesh.receiveShadow = true;

          plotMesh.userData = { plot, plot_no: plot.plot_no, property_id: plot.property_id };

          scene.add(plotMesh);
          plotMeshesMapRef.current.set(String(plot.property_id || plot.plot_no), {
            mesh: plotMesh,
            plot,
            defaultMat: topMat,
          });
        });

        // 6b. Master Plan 3D GPS Location Pin & Floating Amenity Markers
        const drawGpsPinCanvas = (
          ctx: CanvasRenderingContext2D,
          bgColor: string,
          imageObj: HTMLImageElement | null,
          symbol: string,
          title: string
        ) => {
          ctx.clearRect(0, 0, 512, 512);

          // 1. Top Tooltip Pill with Amenity Name (Large & Ultra-Readable)
          if (title) {
            ctx.save();
            const displayText = title.length > 16 ? title.substring(0, 15) + "…" : title.toUpperCase();
            ctx.font = "900 46px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
            const textWidth = ctx.measureText(displayText).width;
            const pillW = Math.max(textWidth + 64, 160);
            const pillH = 74;
            const pillX = 256 - pillW / 2;
            const pillY = 12;

            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 37);
            ctx.fillStyle = "rgba(15, 23, 42, 0.98)";
            ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
            ctx.shadowBlur = 18;
            ctx.shadowOffsetY = 6;
            ctx.fill();

            ctx.lineWidth = 4.5;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(displayText, 256, pillY + pillH / 2 + 2);
            ctx.restore();
          }

          // 2. GPS Teardrop Map Pin Body
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(256, 494);
          ctx.bezierCurveTo(126, 380, 114, 310, 114, 255);
          ctx.arc(256, 255, 142, Math.PI, 0, false);
          ctx.bezierCurveTo(398, 310, 386, 380, 256, 494);
          ctx.closePath();

          const pinGrad = ctx.createLinearGradient(114, 113, 398, 494);
          pinGrad.addColorStop(0, bgColor);
          pinGrad.addColorStop(1, "#0f172a");
          ctx.fillStyle = pinGrad;
          ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
          ctx.shadowBlur = 20;
          ctx.shadowOffsetY = 10;
          ctx.fill();

          ctx.lineWidth = 10;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();
          ctx.restore();

          // 3. Inner Circular Disc for SVG Highlight
          ctx.save();
          ctx.beginPath();
          ctx.arc(256, 255, 114, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 8;
          ctx.fill();

          ctx.lineWidth = 4;
          ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
          ctx.stroke();
          ctx.restore();

          // 4. Highlight the Uploaded SVG or Fallback Icon inside the GPS circle
          if (imageObj && imageObj.complete) {
            try {
              ctx.save();
              ctx.beginPath();
              ctx.arc(256, 255, 112, 0, Math.PI * 2);
              ctx.clip();
              ctx.drawImage(imageObj, 144, 143, 224, 224);
              ctx.restore();
            } catch (err) {
              console.warn("Error drawing SVG icon to canvas:", err);
            }
          } else {
            ctx.save();
            ctx.fillStyle = bgColor;
            ctx.font = "bold 96px system-ui, -apple-system, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(symbol, 256, 255);
            ctx.restore();
          }
        };

        amenitiesRef.current.forEach((am, idx) => {
          const amKey = String((am as any)._uniqueKey || am.id ? `${am.id}_${idx}` : `amenity_${idx}_${am.x_percent}_${am.y_percent}`);
          (am as any)._uniqueKey = amKey;

          const amX = ((am.x_percent - 50) / 100) * planeWidth;
          const amZ = ((am.y_percent - 50) / 100) * planeHeight;
          const colorHex = am.color || "#8b5cf6";
          const iconSymbol = AMENITY_ICONS[am.icon || ""] || "✨";

          const amenityGroup = new THREE.Group();
          amenityGroup.position.set(amX, 0, amZ);

          // 1. Ground Pulsing Radar Ring
          const ringGeo = new THREE.RingGeometry(6, 12, 32);
          ringGeo.rotateX(-Math.PI / 2);
          const ringMat = new THREE.MeshBasicMaterial({
            color: new THREE.Color(colorHex),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.85,
          });
          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.position.y = 1.0;
          amenityGroup.add(ringMesh);

          // 2. 3D GPS Location Pin Billboard Sprite
          const spriteCanvas = document.createElement("canvas");
          spriteCanvas.width = 512;
          spriteCanvas.height = 512;
          const sCtx = spriteCanvas.getContext("2d");
          if (sCtx) {
            drawGpsPinCanvas(sCtx, colorHex, null, iconSymbol, am.title);
          }
          const spriteTex = new THREE.CanvasTexture(spriteCanvas);
          spriteTex.minFilter = THREE.LinearFilter;
          const spriteMat = new THREE.SpriteMaterial({
            map: spriteTex,
            transparent: true,
            depthTest: true,
          });
          const sprite = new THREE.Sprite(spriteMat);
          sprite.scale.set(28, 28, 1);
          sprite.position.y = 19;
          sprite.userData = { amenity: am, isAmenity: true, uniqueKey: amKey, group: amenityGroup };
          amenityGroup.add(sprite);

          // 3. Invisible Collision Target Sphere for Smooth Hover Raycasting
          const hitGeo = new THREE.SphereGeometry(10, 16, 16);
          const hitMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
            visible: true,
          });
          const hitMesh = new THREE.Mesh(hitGeo, hitMat);
          hitMesh.position.y = 19;
          hitMesh.userData = { amenity: am, isAmenity: true, uniqueKey: amKey, group: amenityGroup };
          amenityGroup.add(hitMesh);

          // 4. Asynchronously Load Custom SVG Image via Data URL to avoid CORS and canvas tainting
          const resolvedImgUrl = getFullAssetUrl(am.icon_image || am.icon_image_url);
          if (resolvedImgUrl) {
            const loadIntoCanvas = (src: string) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              img.onload = () => {
                if (sCtx) {
                  drawGpsPinCanvas(sCtx, colorHex, img, iconSymbol, am.title);
                  spriteTex.needsUpdate = true;
                }
              };
              img.src = src;
            };

            const proxyUrl = resolvedImgUrl.includes("/core/public/officedocs/")
              ? "/core/public/officedocs/" + resolvedImgUrl.split("/core/public/officedocs/")[1]
              : resolvedImgUrl.includes("/officedocs/")
              ? "/officedocs/" + resolvedImgUrl.split("/officedocs/")[1]
              : resolvedImgUrl;

            fetch(proxyUrl)
              .then((res) => {
                if (!res.ok) throw new Error("Proxy fetch failed: " + res.status);
                return res.text();
              })
              .then((svgText) => {
                if (svgText && svgText.includes("<svg")) {
                  const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
                  loadIntoCanvas(dataUrl);
                } else {
                  loadIntoCanvas(resolvedImgUrl);
                }
              })
              .catch(() => {
                fetch(resolvedImgUrl)
                  .then((res) => res.text())
                  .then((svgText) => {
                    if (svgText && svgText.includes("<svg")) {
                      const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
                      loadIntoCanvas(dataUrl);
                    } else {
                      loadIntoCanvas(resolvedImgUrl);
                    }
                  })
                  .catch(() => {
                    loadIntoCanvas(resolvedImgUrl);
                  });
              });
          }

          scene.add(amenityGroup);

          amenityMeshesMapRef.current.set(amKey, {
            group: amenityGroup,
            mesh: hitMesh,
            pulseRing: ringMesh,
            amenity: am,
          });
        });

        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (err) => console.error("Error loading 3D map texture:", err)
    );

    // 7. Raycasting & Interaction with Robust Hit Target Resolution
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    const getRaycastTargets = () => {
      const targets: THREE.Object3D[] = [];
      amenityMeshesMapRef.current.forEach((item) => {
        if (item.group && item.group.visible) {
          if (item.mesh) targets.push(item.mesh);
          // Include sprite & billboard children so clicking any part of the pin or label hits reliably
          item.group.children.forEach((child) => {
            if (!targets.includes(child)) {
              targets.push(child);
            }
          });
        }
      });
      plotMeshesMapRef.current.forEach((item) => {
        if (item.mesh) {
          targets.push(item.mesh);
        }
      });
      return targets;
    };

    let containerW = container.clientWidth || 800;
    let containerH = container.clientHeight || 600;

    const handleSelectAtCoords = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = getRaycastTargets();
      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        for (const hit of intersects) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && !cur.userData?.isAmenity && !cur.userData?.plot) {
            cur = cur.parent;
          }
          if (!cur) cur = hit.object;

          if (cur.userData?.isAmenity) {
            const am = cur.userData.amenity as VentureAmenityPin;
            setSelectedAmenityModal(am);
            if (onSelectAmenity) {
              onSelectAmenity(am);
            }
            return true;
          } else if (cur.userData?.plot) {
            const hitPlot = cur.userData.plot as VentureInteractiveMapPlot;
            onSelectPlotRef.current(hitPlot);
            return true;
          }
        }
      }
      return false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      pointerDownTime = Date.now();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isMouseOverCardRef.current) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = getRaycastTargets();
      const intersects = raycaster.intersectObjects(targets, true);

      if (intersects.length > 0) {
        let foundAmenity: VentureAmenityPin | null = null;
        let foundPlot: VentureInteractiveMapPlot | null = null;

        for (const hit of intersects) {
          let cur: THREE.Object3D | null = hit.object;
          while (cur && !cur.userData?.isAmenity && !cur.userData?.plot) {
            cur = cur.parent;
          }
          if (!cur) cur = hit.object;

          if (cur.userData?.isAmenity && !foundAmenity) {
            foundAmenity = cur.userData.amenity as VentureAmenityPin;
            break;
          } else if (cur.userData?.plot && !foundPlot) {
            foundPlot = cur.userData.plot as VentureInteractiveMapPlot;
            break;
          }
        }

        if (foundAmenity) {
          if (hoveredAmenityRef.current !== foundAmenity) {
            hoveredAmenityRef.current = foundAmenity;
            setHoveredAmenityState(foundAmenity);
          }
          if (hoveredPlotRef.current !== null) {
            hoveredPlotRef.current = null;
            setHoveredPlotState(null);
          }
          renderer.domElement.style.cursor = "pointer";
          return;
        }

        if (foundPlot) {
          if (hoveredAmenityRef.current !== null) {
            hoveredAmenityRef.current = null;
            setHoveredAmenityState(null);
          }
          if (hoveredPlotRef.current?.property_id !== foundPlot.property_id) {
            hoveredPlotRef.current = foundPlot;
            setHoveredPlotState(foundPlot);
          }
          renderer.domElement.style.cursor = "pointer";
          return;
        }
      }

      if (hoveredAmenityRef.current !== null) {
        hoveredAmenityRef.current = null;
        setHoveredAmenityState(null);
      }
      if (hoveredPlotRef.current !== null) {
        hoveredPlotRef.current = null;
        setHoveredPlotState(null);
      }
      renderer.domElement.style.cursor = "default";
    };

    const handlePointerLeave = () => {
      if (isMouseOverCardRef.current) return;
      if (!selectedPlotRef.current) {
        hoveredPlotRef.current = null;
        setHoveredPlotState(null);
      }
      hoveredAmenityRef.current = null;
      setHoveredAmenityState(null);
      renderer.domElement.style.cursor = "default";
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 15) return;
      handleSelectAtCoords(e.clientX, e.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 15) return;
      handleSelectAtCoords(e.clientX, e.clientY);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener("pointerdown", handlePointerDown);
    domEl.addEventListener("pointermove", handlePointerMove);
    domEl.addEventListener("pointerup", handlePointerUp);
    domEl.addEventListener("pointerleave", handlePointerLeave);
    domEl.addEventListener("click", handleClick);

    // 8. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      containerW = container.clientWidth;
      containerH = container.clientHeight;
      camera.aspect = containerW / containerH;
      camera.updateProjectionMatrix();
      renderer.setSize(containerW, containerH);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop & Screen Position Projector
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // 🚁 Smooth Drone Guided Tour Camera Update
      if (droneTourStateRef.current.active) {
        const state = droneTourStateRef.current;
        const wps = state.waypoints;
        if (wps.length > 0 && !state.paused) {
          const currentWp = wps[state.currentIdx];
          const speed = state.speed;
          const flightDuration = 4500 / speed;
          const hoverDuration = 3800 / speed;
          const now = performance.now();

          if (flightTrackRef.current.prevIdx !== state.currentIdx) {
            flightTrackRef.current.startCamPos.copy(camera.position);
            flightTrackRef.current.startTargetPos.copy(controls.target);
            flightTrackRef.current.prevIdx = state.currentIdx;
            state.phaseStartTime = now;
            state.phase = "flying";
          }

          const elapsed = now - state.phaseStartTime;

          if (state.phase === "flying") {
            const rawT = Math.min(elapsed / flightDuration, 1);
            // Perlin Smootherstep: 6t^5 - 15t^4 + 10t^3 -> zero 1st & 2nd derivatives at endpoints
            const easeT = rawT * rawT * rawT * (rawT * (rawT * 6 - 15) + 10);

            // Throttle progress state updates to avoid React rendering micro-stalls
            const pct = Math.round(rawT * 100);
            if (pct !== lastProgressUpdateRef.current) {
              lastProgressUpdateRef.current = pct;
              setFlightProgress(pct);
            }

            // Interpolate camera position with smooth altitude apex arc
            const directPos = new THREE.Vector3().lerpVectors(
              flightTrackRef.current.startCamPos,
              currentWp.cameraPos,
              easeT
            );
            const arcHeight = Math.sin(easeT * Math.PI) * 28;
            directPos.y += arcHeight;

            camera.position.copy(directPos);
            controls.target.lerpVectors(
              flightTrackRef.current.startTargetPos,
              currentWp.targetPos,
              easeT
            );

            if (rawT >= 1) {
              state.phase = "hovering";
              state.phaseStartTime = now;
              lastProgressUpdateRef.current = 100;
              setFlightProgress(100);
            }
          } else if (state.phase === "hovering") {
            const hoverElapsed = elapsed;

            // Silky smooth hover drift: pure sine waves starting strictly at 0 offset when hover begins
            const driftX = Math.sin(hoverElapsed * 0.0006 * speed) * 8;
            const driftZ = Math.sin(hoverElapsed * 0.00045 * speed) * 6;
            const driftY = Math.sin(hoverElapsed * 0.001 * speed) * 3;

            const baseCam = currentWp.cameraPos;
            camera.position.set(baseCam.x + driftX, baseCam.y + driftY, baseCam.z + driftZ);
            controls.target.copy(currentWp.targetPos);

            if (hoverElapsed >= hoverDuration) {
              const nextIdx = (state.currentIdx + 1) % wps.length;
              state.currentIdx = nextIdx;
              setDroneWaypointIdx(nextIdx);
              state.phase = "flying";
              state.phaseStartTime = now;
              flightTrackRef.current.startCamPos.copy(camera.position);
              flightTrackRef.current.startTargetPos.copy(controls.target);
              flightTrackRef.current.prevIdx = nextIdx;
            }
          }

          // Throttle telemetry update to 4Hz (every 250ms) to preserve 60fps WebGL smoothness
          if (now - lastTelemetryUpdateRef.current > 250) {
            lastTelemetryUpdateRef.current = now;
            setDroneTelemetry({
              altitude: Math.round(camera.position.y),
              angle: Math.round(cameraAngleRef.current),
            });
          }
        }
      }

      controls.update();

      if (controls) {
        const azimuth = controls.getAzimuthalAngle();
        const deg = (azimuth * 180) / Math.PI;
        cameraAngleRef.current = deg;
        const nowMs = performance.now();
        if (Math.abs(deg - lastAngleStateRef.current) >= 2 && nowMs - lastAngleUpdateRef.current > 150) {
          lastAngleStateRef.current = deg;
          lastAngleUpdateRef.current = nowMs;
          setCameraAngle(deg);
        }
      }

      // Animate 3D Amenity pulse radar rings and levitation
      const now = Date.now();
      amenityMeshesMapRef.current.forEach((item) => {
        if (item.pulseRing) {
          const pulse = (now * 0.002) % (Math.PI * 2);
          const scaleVal = 0.85 + Math.sin(pulse) * 0.45;
          item.pulseRing.scale.set(scaleVal, scaleVal, 1);
          (item.pulseRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0.15, 0.9 - scaleVal * 0.5);
        }
        if (item.mesh) {
          item.mesh.position.y = 19 + Math.sin(now * 0.003 + item.amenity.x_percent) * 1.2;
        }
      });

      // Project active plot (selected or hovered) 3D position to 2D screen coordinates for Speech Bubble
      const activeCalloutPlot = selectedPlotRef.current || hoveredPlotRef.current;
      if (activeCalloutPlot) {
        const targetItem = plotMeshesMapRef.current.get(
          String(activeCalloutPlot.property_id || activeCalloutPlot.plot_no)
        );
        if (targetItem) {
          const plotPos = targetItem.mesh.position.clone();
          plotPos.y += 11; // Anchor slightly above the top face of the 3D plot

          const projected = plotPos.project(camera);
          // Check if in front of camera
          if (projected.z < 1) {
            const screenX = ((projected.x + 1) * containerW) / 2;
            const screenY = ((-projected.y + 1) * containerH) / 2;

            if (
              !lastCalloutPosRef.current.visible ||
              Math.hypot(screenX - lastCalloutPosRef.current.x, screenY - lastCalloutPosRef.current.y) > 1.2
            ) {
              lastCalloutPosRef.current = { x: screenX, y: screenY, visible: true };
              setCalloutScreenPos({
                x: screenX,
                y: screenY,
                visible: true,
              });
            }
          } else {
            if (lastCalloutPosRef.current.visible) {
              lastCalloutPosRef.current.visible = false;
              setCalloutScreenPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }
          }
        }
      } else {
        if (lastCalloutPosRef.current.visible) {
          lastCalloutPosRef.current.visible = false;
          setCalloutScreenPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        }
      }

      // Project hovered amenity 3D position to 2D screen coordinates for Hover Card
      if (hoveredAmenityRef.current) {
        const amKey =
          (hoveredAmenityRef.current as any)._uniqueKey ||
          hoveredAmenityRef.current.id;
        const item = amenityMeshesMapRef.current.get(amKey);
        if (item && item.group) {
          const amPos = item.group.position.clone();
          amPos.y += 34; // anchor above the floating GPS pin
          const projected = amPos.project(camera);
          if (projected.z < 1) {
            const screenX = ((projected.x + 1) * containerW) / 2;
            const screenY = ((-projected.y + 1) * containerH) / 2;
            if (
              !lastAmenityPosRef.current.visible ||
              Math.hypot(screenX - lastAmenityPosRef.current.x, screenY - lastAmenityPosRef.current.y) > 1.5
            ) {
              lastAmenityPosRef.current = { x: screenX, y: screenY, visible: true };
              setAmenityHoverPos({
                x: screenX,
                y: screenY,
                visible: true,
              });
            }
          } else {
            if (lastAmenityPosRef.current.visible) {
              lastAmenityPosRef.current.visible = false;
              setAmenityHoverPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
            }
          }
        }
      } else {
        if (lastAmenityPosRef.current.visible) {
          lastAmenityPosRef.current.visible = false;
          setAmenityHoverPos((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("pointerdown", handlePointerDown);
      domEl.removeEventListener("pointermove", handlePointerMove);
      domEl.removeEventListener("pointerup", handlePointerUp);
      domEl.removeEventListener("pointerleave", handlePointerLeave);
      domEl.removeEventListener("click", handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [map.image_url, applyControlModes]);

  // Update selected / hover plot highlighting & filter dimming in 3D without tearing down the scene
  useEffect(() => {
    plotMeshesMapRef.current.forEach(({ mesh, plot }) => {
      const isSelected = selectedPlot?.property_id === plot.property_id;
      const isHovered = hoveredPlotState?.property_id === plot.property_id;
      const isMatching = isPlotMatching ? isPlotMatching(plot) : true;

      const baseY = 5.1;

      // Smoothly adjust materials opacity for filtered vs matching plots
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
          if (isAnyFilterActive && !isMatching) {
            mat.opacity = 0.18;
            mat.depthWrite = false;
          } else {
            mat.opacity = 1.0;
            mat.depthWrite = true;
          }
        });
      }

      if (isSelected) {
        mesh.position.y = baseY + 8;
        mesh.scale.set(1.18, 1.6, 1.18);
        mesh.visible = true;
      } else if (isHovered) {
        mesh.position.y = baseY + 4;
        mesh.scale.set(1.1, 1.3, 1.1);
        mesh.visible = true;
      } else if (isAnyFilterActive && !isMatching) {
        mesh.position.y = baseY - 1;
        mesh.scale.set(0.88, 0.45, 0.88);
        mesh.visible = true;
      } else {
        mesh.position.y = baseY;
        mesh.scale.set(1, 1, 1);
        mesh.visible = true;
      }
    });
  }, [selectedPlot, hoveredPlotState, isPlotMatching, isAnyFilterActive]);

  // Synchronize 3D Amenity Pins visibility when showAmenities toggles
  useEffect(() => {
    amenityMeshesMapRef.current.forEach(({ group }) => {
      if (group) {
        group.visible = showAmenities;
      }
    });
  }, [showAmenities]);

  // Soft Cinematic Fly-To Animation (Turns to North, flies in close with smooth deceleration)
  useEffect(() => {
    if (!selectedPlot || !controlsRef.current || !cameraRef.current) return;
    const targetItem = plotMeshesMapRef.current.get(
      String(selectedPlot.property_id || selectedPlot.plot_no)
    );
    if (!targetItem) return;

    if (flyAnimRef.current) {
      cancelAnimationFrame(flyAnimRef.current);
      flyAnimRef.current = null;
    }

    const targetPos = targetItem.mesh.position;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const startTarget = controls.target.clone();
    // Offset target slightly behind the plot so the plot sits comfortably in the lower-center of the screen
    const endTarget = new THREE.Vector3(targetPos.x, 0, targetPos.z - 52);

    const startCamPos = camera.position.clone();
    // North-facing isometric close-up view framed to give ample headroom for the speech bubble
    const endCamPos = new THREE.Vector3(targetPos.x, 145, targetPos.z + 175);

    let frame = 0;
    const totalFrames = 40; // ~650ms smooth cinematic transition

    const easeInOutCubic = (x: number): number => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    const animateFlyTo = () => {
      frame++;
      const t = Math.min(frame / totalFrames, 1);
      const easeT = easeInOutCubic(t);

      controls.target.lerpVectors(startTarget, endTarget, easeT);
      camera.position.lerpVectors(startCamPos, endCamPos, easeT);
      controls.update();

      if (frame < totalFrames) {
        flyAnimRef.current = requestAnimationFrame(animateFlyTo);
      } else {
        flyAnimRef.current = null;
      }
    };
    animateFlyTo();

    return () => {
      if (flyAnimRef.current) {
        cancelAnimationFrame(flyAnimRef.current);
      }
    };
  }, [selectedPlot]);

  // 🚁 Build Dynamic Drone Tour Flight Waypoints from Actual Placed Amenities & Key Perspectives
  const buildTourWaypoints = useCallback((): DroneWaypoint[] => {
    const pWidth = planeDimensionsRef.current.width || 700;
    const pHeight = planeDimensionsRef.current.height || 700;
    const pts: DroneWaypoint[] = [];

    // 1. Overview Bird's Eye Establishing View
    pts.push({
      id: "wp_overview",
      title: "Master Plan 3D Aerial Overview",
      subtitle: "High-altitude scan of the gated venture, road network, and master layout.",
      badge: "AERIAL OVERVIEW",
      cameraPos: new THREE.Vector3(0, 520, 520),
      targetPos: new THREE.Vector3(0, 0, 0),
      iconSymbol: "🦅",
      color: "#6366f1",
    });

    // 2. Placed Master Landmark Amenities ONLY (Only what is placed in this venture)
    amenitiesRef.current.forEach((am, i) => {
      const amX = ((am.x_percent - 50) / 100) * pWidth;
      const amZ = ((am.y_percent - 50) / 100) * pHeight;
      const camOffsetX = amX >= 0 ? -60 : 60;
      const camOffsetZ = amZ >= 0 ? 115 : 135;
      pts.push({
        id: `wp_am_${am.id || i}`,
        title: am.title,
        subtitle: am.description || `${am.category_group || "Master Lifestyle"} feature designed for luxury living.`,
        badge: am.badge || am.category_group || "MASTER AMENITY",
        category: am.category_group || am.category,
        cameraPos: new THREE.Vector3(amX + camOffsetX, 95, amZ + camOffsetZ),
        targetPos: new THREE.Vector3(amX, 15, amZ),
        iconImage: am.icon_image || am.icon_image_url,
        iconSymbol: AMENITY_ICONS[am.icon || ""] || "✨",
        color: am.color || "#8b5cf6",
      });
    });

    // 3. Center Boulevard & Main Avenue Perspective
    pts.push({
      id: "wp_center",
      title: "Center Boulevard & Avenue Perspective",
      subtitle: "Low-altitude view across central 60ft avenue and arterial access roads.",
      badge: "CENTER PERSPECTIVE",
      cameraPos: new THREE.Vector3(0, 130, pHeight * 0.38),
      targetPos: new THREE.Vector3(0, 0, 0),
      iconSymbol: "🛣️",
      color: "#0284c7",
    });

    // 4. North-East Corner View
    pts.push({
      id: "wp_corner_ne",
      title: "North-East Corner View",
      subtitle: "Dramatic corner aerial perspective overlooking avenue plots and open green spaces.",
      badge: "CORNER PERSPECTIVE",
      cameraPos: new THREE.Vector3(pWidth * 0.36, 240, pHeight * 0.36),
      targetPos: new THREE.Vector3(0, 0, 0),
      iconSymbol: "📐",
      color: "#10b981",
    });

    // 5. 360° Perimeter Flight
    pts.push({
      id: "wp_orbit",
      title: "360° Venture Perimeter Scan",
      subtitle: "Continuous aerial orbit around all venture boundaries and surroundings.",
      badge: "360° ORBIT",
      cameraPos: new THREE.Vector3(-pWidth * 0.36, 340, pHeight * 0.36),
      targetPos: new THREE.Vector3(0, 0, 0),
      iconSymbol: "🔄",
      color: "#f59e0b",
    });

    return pts;
  }, []);

  const startDroneTour = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    const wps = buildTourWaypoints();
    if (wps.length === 0) return;

    setDroneWaypoints(wps);
    setDroneWaypointIdx(0);
    setIsDroneTourActive(true);
    setIsDronePaused(false);
    setSelectedAmenityModal(null);
    setHoveredPlotState(null);
    setHoveredAmenityState(null);

    const now = performance.now();
    droneTourStateRef.current = {
      active: true,
      paused: false,
      currentIdx: 0,
      speed: droneSpeed,
      startTime: now,
      phase: "flying",
      phaseStartTime: now,
      waypoints: wps,
    };
  }, [buildTourWaypoints, droneSpeed]);

  const stopDroneTour = useCallback(() => {
    setIsDroneTourActive(false);
    setIsDronePaused(false);
    droneTourStateRef.current.active = false;
  }, []);

  const toggleDronePause = useCallback(() => {
    setIsDronePaused((prev) => {
      const next = !prev;
      droneTourStateRef.current.paused = next;
      if (!next) {
        droneTourStateRef.current.phaseStartTime = performance.now();
      }
      return next;
    });
  }, []);

  const jumpToDroneWaypoint = useCallback((idx: number) => {
    if (!droneTourStateRef.current.waypoints[idx]) return;
    setDroneWaypointIdx(idx);
    droneTourStateRef.current.currentIdx = idx;
    droneTourStateRef.current.phase = "flying";
    droneTourStateRef.current.phaseStartTime = performance.now();
    setFlightProgress(0);
  }, []);

  const nextDroneWaypoint = useCallback(() => {
    const wps = droneTourStateRef.current.waypoints;
    if (wps.length === 0) return;
    const nextIdx = (droneTourStateRef.current.currentIdx + 1) % wps.length;
    jumpToDroneWaypoint(nextIdx);
  }, [jumpToDroneWaypoint]);

  const prevDroneWaypoint = useCallback(() => {
    const wps = droneTourStateRef.current.waypoints;
    if (wps.length === 0) return;
    const prevIdx = (droneTourStateRef.current.currentIdx - 1 + wps.length) % wps.length;
    jumpToDroneWaypoint(prevIdx);
  }, [jumpToDroneWaypoint]);

  const cycleDroneSpeed = useCallback(() => {
    setDroneSpeed((prev) => {
      const next = prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1;
      droneTourStateRef.current.speed = next;
      return next;
    });
  }, []);



  // Camera Presets
  const setCameraView = useCallback((mode: "top" | "iso" | "ground") => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    setActivePreset(mode);

    if (mode === "top") {
      camera.position.set(0, 850, 0.001);
      controls.target.set(0, 0, 0);
    } else if (mode === "iso") {
      camera.position.set(0, 480, 480);
      controls.target.set(0, 0, 0);
    } else if (mode === "ground") {
      camera.position.set(0, 160, 560);
      controls.target.set(0, 0, 0);
    }
    controls.update();
  }, []);

  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.multiplyScalar(0.85);
    controlsRef.current.update();
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.multiplyScalar(1.18);
    controlsRef.current.update();
  };

  const handlePan = (dx: number, dz: number) => {
    if (!controlsRef.current || !cameraRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const factor = camera.position.length() * 0.0015;

    controls.target.x += dx * factor;
    controls.target.z += dz * factor;
    camera.position.x += dx * factor;
    camera.position.z += dz * factor;
    controls.update();
  };

  const handleResetNorth = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraView("iso");
  };

  const activePlot = selectedPlot || hoveredPlotState;
  const activePlotColor = activePlot
    ? activePlot.custom_color || statusColorsRef.current[activePlot.status] || "#10b981"
    : "#10b981";

  const activeDetails = (selectedPlot && plotDetails) ? plotDetails : (activePlot as any);

  const rawSqFeet =
    activeDetails?.srq_feets ||
    activeDetails?.sq_feet ||
    activePlot?.srq_feets ||
    activePlot?.sq_feet ||
    (activeDetails?.srq_yards ? Math.round(Number(activeDetails.srq_yards) * 9) : null) ||
    (activeDetails?.sq_yards ? Math.round(Number(activeDetails.sq_yards) * 9) : null) ||
    (activePlot?.sq_yards ? Math.round(Number(activePlot.sq_yards) * 9) : null) ||
    ((activePlot as any)?.srq_yards ? Math.round(Number((activePlot as any).srq_yards) * 9) : null);
  const sqFeet = rawSqFeet ? Math.round(Number(rawSqFeet)) : 1200;

  const rawDimensions =
    activeDetails?.dimensions ||
    activePlot?.dimensions ||
    (activeDetails?.width && activeDetails?.length ? `${activeDetails.width} × ${activeDetails.length} ft` : null) ||
    (activePlot?.width && activePlot?.length ? `${activePlot.width} × ${activePlot.length} ft` : null);
  const dimensions = rawDimensions || (sqFeet ? `${Math.round(sqFeet / 40)} × 40 ft` : "30 × 40 ft");

  const rawRoad = activeDetails?.roadsize || activePlot?.roadsize || "30 FEETS ROAD";
  const roadSizeStr = String(rawRoad).trim();
  const roadSize = roadSizeStr.toLowerCase().includes("ft") || roadSizeStr.toLowerCase().includes("feet")
    ? roadSizeStr
    : `${roadSizeStr} ft`;

  const rawSftCost =
    activeDetails?.sft_cost ||
    activeDetails?.cost_per_sft ||
    activePlot?.sft_cost ||
    activePlot?.cost_per_sft ||
    (activePlot?.total_cost && sqFeet && Number(sqFeet) > 0 ? Math.round(Number(activePlot.total_cost) / Number(sqFeet)) : null);
  const sftCost = isValidCost(rawSftCost)
    ? `${formatCurrency(Number(rawSftCost))} / sq.ft`
    : (activePlot?.total_cost ? `${formatCurrency(Math.round(Number(activePlot.total_cost) / Number(sqFeet)))} / sq.ft` : "₹1,535 / sq.ft");

  return (
    <div className="relative w-full h-full select-none overflow-hidden antialiased">
      {/* Three.js Mounting Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D-ANCHORED MESSAGE-SHAPED DIALOGUE BOX (SPEECH BUBBLE OVER HOVERED / SELECTED PLOT) */}
      {activePlot && calloutScreenPos.visible && (() => {
        // If plot is in the upper part of the screen (< 340px from top), flip bubble to open downwards
        const isFlippedBelow = calloutScreenPos.y < 340;
        const clampedX = Math.max(165, Math.min((mountRef.current?.clientWidth || window.innerWidth) - 165, calloutScreenPos.x));

        return (
          <div
            className="absolute z-40 pointer-events-auto transition-all duration-100 ease-out"
            style={{
              left: `${clampedX}px`,
              top: `${calloutScreenPos.y}px`,
              transform: isFlippedBelow
                ? "translate(-50%, 14px)"
                : "translate(-50%, -100%) translateY(-14px)",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={() => {
              isMouseOverCardRef.current = true;
            }}
            onMouseLeave={() => {
              isMouseOverCardRef.current = false;
              if (!selectedPlot) {
                hoveredPlotRef.current = null;
                setHoveredPlotState(null);
              }
            }}
          >
            {/* Main Speech Bubble Card */}
            <div className="relative w-[295px] sm:w-[325px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150">
              {/* Pointer Arrow on Top (when flipped below) */}
              {isFlippedBelow && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-50 border-l border-t border-slate-200/90 rotate-45 z-10" />
              )}

              {/* Header */}
              <div className="p-3 px-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-8.5 w-8.5 rounded-xl flex items-center justify-center font-extrabold text-white text-xs shadow-xs shrink-0"
                    style={{
                      backgroundColor: activePlotColor,
                      border: "2px solid rgba(255,255,255,0.9)",
                    }}
                  >
                    {activePlot.plot_no}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-sm text-slate-900 leading-tight truncate">
                      Plot {activePlot.plot_no}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {activePlot.facing || activeDetails?.facing || "EAST"} Facing
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border"
                    style={{
                      backgroundColor: `${activePlotColor}18`,
                      borderColor: activePlotColor,
                      color: activePlotColor,
                    }}
                  >
                    {activePlot.status}
                  </span>

                  {onToggleCompare && (
                    <button
                      type="button"
                      onClick={() => onToggleCompare(activePlot)}
                      className={`h-6.5 px-2 rounded-full text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border ${
                        comparedPlotIds.includes(activePlot.property_id)
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border-slate-200 text-slate-700"
                      }`}
                      title={
                        comparedPlotIds.includes(activePlot.property_id)
                          ? "In comparison (Click to remove)"
                          : "Add to comparison"
                      }
                    >
                      <Scale className="h-3 w-3" />
                      <span>{comparedPlotIds.includes(activePlot.property_id) ? "In Compare" : "Compare"}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      isMouseOverCardRef.current = false;
                      hoveredPlotRef.current = null;
                      setHoveredPlotState(null);
                      onClosePlot();
                    }}
                    className="h-6.5 w-6.5 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
                    title="Close Dialogue"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Specifications Body */}
              <div className="p-3 space-y-2 text-xs">
                {detailsLoading ? (
                  <div className="py-2.5 flex items-center justify-center gap-2 text-slate-400">
                    <div className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[11px]">Loading specifications...</span>
                  </div>
                ) : (
                  <>
                    {/* Redzone Alert (if applicable) */}
                    {(activeDetails?.is_redzone === 1 || activeDetails?.redzone_status) && (
                      <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1.5 text-rose-700 text-[10px] font-bold">
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        <span>Redzone Property</span>
                      </div>
                    )}

                    {/* 2x2 Specs Grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 px-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Sq. Feet
                        </span>
                        <div className="text-xs font-bold text-slate-900">
                          {sqFeet ? `${sqFeet} sq.ft` : "N/A"}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 px-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Dimensions
                        </span>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {dimensions}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 px-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Road Size
                        </span>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {roadSize}
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 px-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                          Sft Cost
                        </span>
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {sftCost || "N/A"}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Overview */}
                    {activePlot.total_cost && (
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-1.5 px-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <IndianRupee className="h-3 w-3 text-emerald-600" /> Total Price:
                        </span>
                        <span className="text-xs font-extrabold text-emerald-700">
                          {formatCurrency(activePlot.total_cost)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-2.5 px-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
                {activePlot.status?.toLowerCase().trim() === "available" ? (
                  <>
                    <Button
                      onClick={() => onBookSiteVisit(activePlot)}
                      className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs h-8.5 rounded-xl shadow-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-95"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>BOOK SITE VISIT</span>
                    </Button>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <Button
                        size="sm"
                        onClick={() => onBookPlot(activePlot)}
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs h-8 font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Book Plot</span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onBookSiteVisit(activePlot)}
                        className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs h-8 font-semibold cursor-pointer"
                      >
                        Site Visit
                      </Button>
                    </div>
                  </>
                ) : (
                  onWhatsAppShare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onWhatsAppShare(activePlot)}
                      className="w-full border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 rounded-xl text-xs h-8 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Share Plot Details</span>
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3D Camera Controls Toolbar (Plotex Style - Right Side) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-2 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-xl antialiased">
        {/* Compass Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleResetNorth}
          className="h-9 w-9 rounded-xl text-slate-700 hover:text-indigo-600 hover:bg-slate-100 cursor-pointer relative"
          title="Reset to North Orientation"
        >
          <Compass
            className="h-5 w-5 transition-transform duration-100"
            style={{ transform: `rotate(${-cameraAngle}deg)` }}
          />
        </Button>

        <div className="h-px w-5 bg-slate-200" />

        {/* 🚁 Auto-Pilot Drone Tour Button */}
        <button
          type="button"
          onClick={() => {
            if (isDroneTourActive) {
              stopDroneTour();
            } else {
              startDroneTour();
            }
          }}
          className={`h-8 px-2.5 rounded-xl font-extrabold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-xs ${
            isDroneTourActive
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-2 ring-emerald-400 ring-offset-1 animate-pulse"
              : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white hover:shadow-md"
          }`}
          title="Launch 3D Auto-Pilot Drone Guided Tour"
        >
          <span className="text-xs">🚁</span>
          <span>{isDroneTourActive ? "Touring..." : "Drone Tour"}</span>
        </button>

        <div className="h-px w-5 bg-slate-200" />

        {/* 2D Flat Top-Down View */}
        <button
          type="button"
          onClick={() => setCameraView("top")}
          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center cursor-pointer transition-colors ${
            activePreset === "top"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700"
          }`}
          title="Flat 2D Top-Down View"
        >
          2D Flat
        </button>

        {/* 3D Isometric View */}
        <button
          type="button"
          onClick={() => setCameraView("iso")}
          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center cursor-pointer transition-colors ${
            activePreset === "iso"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700"
          }`}
          title="3D Isometric View"
        >
          3D Iso
        </button>

        {/* Ground Eye View */}
        <button
          type="button"
          onClick={() => setCameraView("ground")}
          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] flex items-center gap-1 justify-center cursor-pointer transition-colors ${
            activePreset === "ground"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700"
          }`}
          title="Cinematic Ground Angle"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Eye</span>
        </button>

        <div className="h-px w-5 bg-slate-200" />

        {/* Toggle Amenities Pins */}
        <button
          type="button"
          onClick={() => setShowAmenities((prev) => !prev)}
          className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
            showAmenities
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          }`}
          title="Toggle Amenities Pins on 3D Map"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Amenities</span>
        </button>

        <div className="h-px w-5 bg-slate-200" />

        {/* Segmented Mouse Drag Mode Switcher (Orbit vs Pan) */}
        <div className="flex flex-col gap-1 w-full">
          <button
            type="button"
            onClick={() => handleSetDragMode("orbit")}
            className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              dragMode === "orbit"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title="Orbit / Rotate Camera with Left Drag"
          >
            <Rotate3d className="h-3.5 w-3.5" />
            <span>Orbit</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetDragMode("pan")}
            className={`h-7 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all ${
              dragMode === "pan"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
            title="Pan / Move Map with Left Drag"
          >
            <Hand className="h-3.5 w-3.5" />
            <span>Pan</span>
          </button>
        </div>
      </div>

      {/* Floating Zoom & Directional Pan Toolbar (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 px-2 rounded-2xl border border-slate-200 shadow-xl antialiased">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="h-4 w-px bg-slate-200" />

        {/* Direct Directional Panning Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePan(0, -140)}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold text-xs"
          title="Pan Up"
        >
          ▲
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePan(0, 140)}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold text-xs"
          title="Pan Down"
        >
          ▼
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePan(-140, 0)}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold text-xs"
          title="Pan Left"
        >
          ◀
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handlePan(140, 0)}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer font-bold text-xs"
          title="Pan Right"
        >
          ▶
        </Button>

        <div className="h-4 w-px bg-slate-200" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCameraView("iso")}
          className="h-8 w-8 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          title="Reset Center View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Floating 3D Amenity Rich Hover Card with Speech Bubble Pointer */}
      {hoveredAmenityState && amenityHoverPos.visible && !selectedAmenityModal && !selectedPlot && (
        <div
          className="pointer-events-none fixed z-40 transform -translate-x-1/2 -translate-y-full pb-3 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: `${amenityHoverPos.x}px`,
            top: `${amenityHoverPos.y}px`,
          }}
        >
          <div className="relative w-72 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-white/20 flex flex-col gap-2.5">
            {/* Header with Avatar & Title */}
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md shrink-0 border border-white/30 overflow-hidden"
                style={{ backgroundColor: hoveredAmenityState.color || "#8b5cf6" }}
              >
                {hoveredAmenityState.icon_image || hoveredAmenityState.icon_image_url ? (
                  <img
                    src={getFullAssetUrl(hoveredAmenityState.icon_image || hoveredAmenityState.icon_image_url) || hoveredAmenityState.icon_image || undefined}
                    alt={hoveredAmenityState.title}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <span>{AMENITY_ICONS[hoveredAmenityState.icon || ""] || "✨"}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                    {hoveredAmenityState.category_group || hoveredAmenityState.category || "Master Amenity"}
                  </span>
                  {hoveredAmenityState.badge && (
                    <span className="bg-amber-400 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      {hoveredAmenityState.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-extrabold text-white truncate leading-snug">
                  {hoveredAmenityState.title}
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11.5px] text-slate-300 line-clamp-2 leading-relaxed">
              {hoveredAmenityState.description || "World-class venture lifestyle feature designed for luxury living."}
            </p>

            {/* Click instruction */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-end text-[10px] font-medium">
              <span className="text-indigo-300 font-bold">Click to view ↗</span>
            </div>

            {/* Speech Bubble Arrow pointing down */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-slate-900/95 border-r border-b border-white/20 transform rotate-45" />
          </div>
        </div>
      )}

      {/* 3D Clicked Amenity Details Modal */}
      {selectedAmenityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedAmenityModal(null)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl shadow-md"
                  style={{ backgroundColor: selectedAmenityModal.color || "#8b5cf6" }}
                >
                  {selectedAmenityModal.icon_image || selectedAmenityModal.icon_image_url ? (
                    <img
                      src={getFullAssetUrl(selectedAmenityModal.icon_image || selectedAmenityModal.icon_image_url) || selectedAmenityModal.icon_image || undefined}
                      alt={selectedAmenityModal.title}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span>{AMENITY_ICONS[selectedAmenityModal.icon || ""] || "✨"}</span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {selectedAmenityModal.category_group || selectedAmenityModal.category || "Master Amenity"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {selectedAmenityModal.title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAmenityModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedAmenityModal.badge && (
              <div>
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  {selectedAmenityModal.badge}
                </span>
              </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed">
              {selectedAmenityModal.description || "World-class venture lifestyle feature designed for luxury living."}
            </p>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedAmenityModal(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 🚁 Drone Tour Top Cinematic HUD Overlay */}
      {isDroneTourActive && droneWaypoints[droneWaypointIdx] && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-xl w-[92%] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-full bg-slate-950/90 backdrop-blur-md text-white rounded-2xl p-3.5 px-4 shadow-2xl border border-white/20 flex items-center justify-between gap-3.5">
            {/* Avatar / Icon */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0 border border-white/30 overflow-hidden"
              style={{ backgroundColor: droneWaypoints[droneWaypointIdx].color || "#6366f1" }}
            >
              {droneWaypoints[droneWaypointIdx].iconImage ? (
                <img
                  src={
                    getFullAssetUrl(droneWaypoints[droneWaypointIdx].iconImage) ||
                    droneWaypoints[droneWaypointIdx].iconImage ||
                    undefined
                  }
                  alt={droneWaypoints[droneWaypointIdx].title}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <span>{droneWaypoints[droneWaypointIdx].iconSymbol || "🚁"}</span>
              )}
            </div>

            {/* Landmark Details */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1.5 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  DRONE LIVE • {droneTelemetry.altitude}m
                </span>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                  {droneWaypoints[droneWaypointIdx].badge}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 ml-auto">
                  {droneWaypointIdx + 1} / {droneWaypoints.length}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white truncate leading-snug">
                {droneWaypoints[droneWaypointIdx].title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                {droneWaypoints[droneWaypointIdx].subtitle}
              </p>
            </div>

            {/* Exit Drone Tour */}
            <button
              type="button"
              onClick={stopDroneTour}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Exit Drone Tour"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Segment Progress Bar */}
          <div className="w-full bg-slate-900/60 backdrop-blur-xs rounded-full h-1.5 overflow-hidden border border-white/10">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-100 ease-linear rounded-full"
              style={{ width: `${flightProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 🚁 Drone Tour Bottom Floating Flight Controller */}
      {isDroneTourActive && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Collapsible Waypoint & Perspectives Drawer */}
          {showWaypointDrawer && (
            <div className="w-80 max-h-72 bg-slate-950/95 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/20 flex flex-col gap-2 animate-in zoom-in-95 duration-150 mb-1">
              <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/10">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <span>🚁</span>
                  <span>Tour Waypoints ({droneWaypoints.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowWaypointDrawer(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-1.5 pr-1 max-h-56 scrollbar-thin">
                {droneWaypoints.map((wp, idx) => {
                  const isActive = idx === droneWaypointIdx;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => {
                        jumpToDroneWaypoint(idx);
                        setShowWaypointDrawer(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2.5 border ${
                        isActive
                          ? "bg-indigo-600/40 border-indigo-400/60 text-white shadow-xs"
                          : "bg-white/5 hover:bg-white/10 border-transparent text-slate-300 hover:text-white"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 shadow-sm overflow-hidden"
                        style={{ backgroundColor: wp.color || "#6366f1" }}
                      >
                        {wp.iconImage ? (
                          <img
                            src={getFullAssetUrl(wp.iconImage) || wp.iconImage || undefined}
                            alt={wp.title}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span>{wp.iconSymbol || "📍"}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                            {wp.badge}
                          </span>
                          {isActive && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                          )}
                        </div>
                        <div className="text-xs font-bold truncate leading-tight">
                          {wp.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/90 backdrop-blur-md text-white p-2 px-3.5 rounded-2xl shadow-2xl border border-white/20">
            {/* Prev Waypoint */}
            <button
              type="button"
              onClick={prevDroneWaypoint}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Landmark"
            >
              <SkipBack className="h-4 w-4" />
            </button>

            {/* Play / Pause */}
            <button
              type="button"
              onClick={toggleDronePause}
              className="p-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 font-bold text-xs"
              title={isDronePaused ? "Resume Drone Tour" : "Pause Drone Tour"}
            >
              {isDronePaused ? (
                <Play className="h-3.5 w-3.5 fill-white" />
              ) : (
                <Pause className="h-3.5 w-3.5 fill-white" />
              )}
              <span>{isDronePaused ? "Resume" : "Pause"}</span>
            </button>

            {/* Next Waypoint */}
            <button
              type="button"
              onClick={nextDroneWaypoint}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Landmark"
            >
              <SkipForward className="h-4 w-4" />
            </button>

            <div className="h-5 w-px bg-white/15 mx-1" />

            {/* 📍 Waypoints & Perspectives Toggler Button */}
            <button
              type="button"
              onClick={() => setShowWaypointDrawer((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showWaypointDrawer
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white"
              }`}
              title="View all tour waypoints and perspectives"
            >
              <span>{droneWaypoints[droneWaypointIdx]?.iconSymbol || "📍"}</span>
              <span className="max-w-[130px] truncate">
                {droneWaypoints[droneWaypointIdx]?.title || "Waypoints"}
              </span>
              <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md font-mono">
                {droneWaypointIdx + 1}/{droneWaypoints.length}
              </span>
              {showWaypointDrawer ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-300" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5 text-slate-300" />
              )}
            </button>

            <div className="h-5 w-px bg-white/15 mx-1" />

            {/* Speed Selector */}
            <button
              type="button"
              onClick={cycleDroneSpeed}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-indigo-300 transition-colors cursor-pointer flex items-center gap-1"
              title="Toggle Flight Speed"
            >
              <FastForward className="h-3 w-3" />
              <span>{droneSpeed}x</span>
            </button>

            <div className="h-5 w-px bg-white/15 mx-1" />

            {/* Exit Button */}
            <button
              type="button"
              onClick={stopDroneTour}
              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
