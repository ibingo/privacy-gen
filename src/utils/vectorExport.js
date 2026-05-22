const normalizeColor = (color) => color.replace('#', '').toUpperCase()

const composePathCall = (path, options) => {
  const color = `Color(0xFF${normalizeColor(path.color || options.primaryColor)})`
  const style = options.iconType === 'fill'
    ? `fill = SolidColor(${color})`
    : `fill = SolidColor(Color.Transparent), stroke = SolidColor(${color}), strokeLineWidth = ${options.strokeWidth}.0f`

  return `        path(${style}) {
            addPath(PathParser().parsePathString("${path.d}").toNodes())
        }`
}

export const buildComposeImageVector = (icon, options) => {
  const propertyName = icon.name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')

  return `import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.unit.dp

val ${propertyName}: ImageVector
    get() = ImageVector.Builder(
        name = "${icon.name}",
        defaultWidth = ${options.size}.dp,
        defaultHeight = ${options.size}.dp,
        viewportWidth = 24f,
        viewportHeight = 24f
    ).apply {
${icon.paths.map((path) => composePathCall(path, options)).join('\n')}
    }.build()
`
}

export const buildAndroidVectorXml = (icon, options) => {
  return `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${options.size}dp"
    android:height="${options.size}dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
${icon.paths.map((path) => {
  const color = `#${normalizeColor(path.color || options.primaryColor)}`
  const pathAttrs = options.iconType === 'fill'
    ? `android:fillColor="${color}"`
    : `android:fillColor="@android:color/transparent"
        android:strokeColor="${color}"
        android:strokeWidth="${options.strokeWidth}"`

  return `    <path
        ${pathAttrs}
        android:strokeLineCap="round"
        android:strokeLineJoin="round"
        android:pathData="${path.d}" />`
}).join('\n')}
</vector>
`
}
