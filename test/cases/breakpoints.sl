:root
  breakpoint-palm: max 300px
  breakpoint-tab: max 700px
  breakpoint-desk: min 1000px
  breakpoint-desk-wide: min 1200px

.palm
  display: none

@media palm
  .palm
    display: block

@media tab
  .tab-hide
    display: none

@media tab-and-down
  body
    font-size: 80%

@media tab-and-up
  header img
    float: left

@media desk-wide
  body
    font-size: 2em