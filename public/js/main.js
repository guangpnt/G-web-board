const profileBtn = document.querySelector('.profile-btn')
const profileMenu = document.querySelector('.profile-menu')
const profileBg = document.querySelector('.profile-bg')
const closeBtn = document.querySelector('.close-btn')

profileBtn.addEventListener('click', () => {
    profileMenu.classList.remove('hide')
    profileBg.classList.remove('hide')
})

profileBg.addEventListener('click', () => {
    profileMenu.classList.add('hide')
    profileBg.classList.add('hide')
})

closeBtn.addEventListener('click', () => {
    profileMenu.classList.add('hide')
    profileBg.classList.add('hide')
})

