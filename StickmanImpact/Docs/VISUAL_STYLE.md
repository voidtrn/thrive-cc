# Visual Style — Cel-Shading Recipes

The anime/cel identity lives in materials + post-process assets; `UVisualStyleSubsystem`
owns the runtime knobs (LUT swap, MPC params, outline stencils, anime-moment triggers).
This doc is the authoring recipe per asset — build these once in the editor.

## Cel-shading post-process (PP_CelShade)

One post-process material in the global PostProcessVolume, Blendable Location = Before
Tonemapping:

- **Light banding**: sample `SceneTexture:DiffuseColor` + `SceneTexture:SubsurfaceColor`;
  quantize the lighting term (`SceneColor / BaseColor`) through a 3-4 step ramp texture
  (a 1D gradient with hard steps). Do NOT smooth-step — hard bands are the look.
- **Colored shadows**: lerp the darkest band toward a cool blue/purple
  (`ShadowTint` vector param), never black.
- **Rim light**: `1 - saturate(dot(Normal, CameraVector))`, power 3-5, masked to characters
  via CustomStencil != 0, tinted by the character's element color (fed from the StyleMPC).
- **Discrete specular**: threshold the specular term (`step(0.7, spec)`) for the single
  sharp anime highlight; hair uses a separate higher threshold band in the hair material
  itself (anisotropic V-ramp).

## Outlines (PP_Outline)

Post-process **depth + normal edge detection** (not inverted hull — one material outlines
everything, thickness controllable):

- Sobel over `SceneTexture:CustomDepth` + `WorldNormal`; edge where depth delta > threshold
  scaled by distance (`thickness = BaseThickness * saturate(NearFade / PixelDepth)` —
  thicker near camera).
- Color from `CustomStencil`: 3=ally green, 4=enemy red, 5=neutral white, 6=item gold,
  7=quest sparkle (values 1/2 are reserved by detective mode: cyan/gold). Through-wall =
  the custom-depth pass already ignores occlusion; mask "through-wall" draw to stencils 3-5.
- `UVisualStyleSubsystem::SetActorOutline` stamps the stencils; `SetOutlinesEnabled` is the
  settings toggle (bind in the settings screen).

## Color grading

- **Per-region LUTs**: one 32³ LUT texture per region (Mondstadt warm-golden, Liyue earthy,
  Inazuma electric-purple, Sumeru lush/desert, Fontaine teal, Natlan red-orange, Snezhnaya
  crisp blue-white). Applied by `SetRegionLUT` from the same place region BGM changes.
- **Time-of-day**: the grading material reads `StyleMPC.TimeOfDayBlend` (0 dawn → .25 noon
  → .5 dusk → .75 night) and lerps a color ramp (pink-orange → bright → purple-orange →
  blue-magenta). Drive from `ADayNightManager` (hour/24).
- **Weather**: `WeatherDesaturation` + `WeatherContrast` MPC scalars (rain 0.4/0.9,
  storm 0.2/1.3, fog 0.6/0.7). Drive from `UWeatherManager::OnWeatherChanged`.

## Anime moments (M_AnimeFX)

Full-screen UI-domain material on a HUD-level widget (or PP blendable):

- **Speed lines**: radial line texture scrolled from screen edges, opacity =
  `StyleMPC.SpeedLines` (triggered by dash/sprint via `TriggerSpeedLines`).
- **Impact frame**: `StyleMPC.ImpactFrame` flashes an inverted/white frame + action lines
  for ~0.08s on heavy hits (`TriggerImpactFrame` from the combat juice hooks).
- **Screen tone**: optional dot-pattern overlay on the shadow bands (toggle param).
- Motion smear = Niagara ribbon on fast limbs; emotion markers (sweat drop, anger mark) =
  Niagara sprites at a head socket — content, not shader.

## Character/environment materials

- Characters: flat base color + the PP cel bands do the shading; emissive slot for
  elemental glow (`TellFlash`/`TellUnparryable` scalars already used by telegraphs).
- Environment: hand-painted-look textures, vertex-color terrain blending, billboard leaf
  clusters (cel-shaded by the same PP).
- Water: stylized normal-pattern waves + hard-banded reflection, caustics as a scrolling
  pattern texture underwater.

All shader work is asset-side; the only code dependency is the StyleMPC param names above.
