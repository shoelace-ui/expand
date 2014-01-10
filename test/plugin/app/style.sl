:require
  theme: shoelace-ui/theme
  local: ./style.css

:locals
  color: red

.bg
  background: $theme/background
  font-family: $theme/my-theme-fonts

:content
  from: theme

.my-content
  extend: $theme/row

:content
  from: local

:exports
  color: $color