$(document).ready(function () {
  var hamburger = $('button.hamburger')
  var navBar = $('nav')
  var navBarItems = navBar.children('ul')

  hamburger.click(function () {
    hamburger.toggleClass('is-active')

    if (hamburger.hasClass('is-active')) {
      navBar.height(navBarItems.prop('scrollHeight'))
    } else {
      navBar.height(0)
    }
  })
})
