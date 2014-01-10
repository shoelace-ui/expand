
body
  margin: 0
  padding: 5px
  ul
    margin: 0
    li:first-child
      border-top: none
      // test
    // test
    li:last-child
      border-bottom: none

ul
  li
    &:first-child,
    &:last-child
      display: none

foo
  border-radius: 5px

foo bar baz
  border-radius: 5px

foo,
bar,
baz
  border-radius: 5px

input[type=button]
  border-radius: 5px

button,
input[type=button],
input[type=submit],
a.button
  border-radius: 5px

.foo
  width: 10px
  .bar
    width: 10px