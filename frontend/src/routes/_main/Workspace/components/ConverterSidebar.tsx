import { useState } from 'react'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import LutSelect from '../../../../components/LUT/LutSelect'
import ColorDetail from './ColorDetail/ColorDetail'
import ColorModeSelect from './ColorModeSelect/ColorModeSelect'
import GenerateButton from './ConvertActions/GenerateButton'
import PreviewButton from './ConvertActions/PreviewButton'
import Dimensions from './Dimensions/Dimensions'
import ImageUpload from './ImageUpload/ImageUpload'
import KeychainLoop from './KeychainLoop/KeychainLoop'
import ModelingModeSelect from './ModelingModeSelect/ModelingModeSelect'
import RemoveBg from './RemoveBg/RemoveBg'
import StructureSelect from './StructureSelect/StructureSelect'
import styles from './ConverterSidebar.module.scss'

type ColorMode = 'CMYW' | 'RYBW'
type Structure = 'double' | 'single'
type ModelingMode = 'hifi' | 'pixel' | 'vector'

const ConverterSidebar: React.FC = () => {
  const [lut, setLut] = useState('')
  const [colorMode, setColorMode] = useState<ColorMode>('CMYW')
  const [structure, setStructure] = useState<Structure>('double')
  const [modelingMode, setModelingMode] = useState<ModelingMode>('hifi')
  const [quantizeColors, setQuantizeColors] = useState(6)
  const [removeBg, setRemoveBg] = useState(false)
  const [bgTolerance, setBgTolerance] = useState(30)
  const [width, setWidth] = useState(80)
  const [height, setHeight] = useState(80)
  const [thickness, setThickness] = useState(2.8)
  const [loopEnabled, setLoopEnabled] = useState(false)
  const [loopWidth, setLoopWidth] = useState(8)
  const [loopLength, setLoopLength] = useState(12)
  const [loopHole, setLoopHole] = useState(3)

  return (
    <Stack className={styles.root} spacing={0} divider={<Divider />} padding="8px">
      <LutSelect lutFileName={lut} changeLutFileName={setLut} />
      <ImageUpload />
      <ColorModeSelect value={colorMode} onChange={setColorMode} />
      <StructureSelect value={structure} onChange={setStructure} />
      <ModelingModeSelect value={modelingMode} onChange={setModelingMode} />
      <ColorDetail value={quantizeColors} onChange={setQuantizeColors} />
      <RemoveBg
        enabled={removeBg}
        onEnabledChange={setRemoveBg}
        tolerance={bgTolerance}
        onToleranceChange={setBgTolerance}
      />
      <Dimensions
        width={width}
        onWidthChange={setWidth}
        height={height}
        onHeightChange={setHeight}
        thickness={thickness}
        onThicknessChange={setThickness}
      />
      <PreviewButton
        lut={lut}
        colorMode={colorMode}
        modelingMode={modelingMode}
        quantizeColors={quantizeColors}
        removeBg={removeBg}
        bgTolerance={bgTolerance}
        width={width}
      />
      <KeychainLoop
        enabled={loopEnabled}
        onEnabledChange={setLoopEnabled}
        width={loopWidth}
        onWidthChange={setLoopWidth}
        length={loopLength}
        onLengthChange={setLoopLength}
        hole={loopHole}
        onHoleChange={setLoopHole}
      />
      <GenerateButton
        lut={lut}
        colorMode={colorMode}
        structure={structure}
        modelingMode={modelingMode}
        quantizeColors={quantizeColors}
        removeBg={removeBg}
        bgTolerance={bgTolerance}
        width={width}
        thickness={thickness}
        loopEnabled={loopEnabled}
        loopWidth={loopWidth}
        loopLength={loopLength}
        loopHole={loopHole}
      />
    </Stack>
  )
}

export { ConverterSidebar }
