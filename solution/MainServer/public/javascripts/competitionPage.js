let lateralCompetitionButtons
let matchButtons
const competitionPageName = 'competition-page'
document.addEventListener('DOMContentLoaded',()=>{
    let competitionInfoBtn= document.getElementById('competition-info-btn')
    lateralCompetitionButtons = document.querySelectorAll('#competitionLateralNavbar .lateral-menu-button')
    lateralCompetitionButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            hideAllMainContainers(competitionPageName)
            let containerToShow = button.getAttribute('data-showContainer')
            document.getElementById(containerToShow).style.display="flex"
        })
    })
    manageLateralButtons(lateralCompetitionButtons)
    //inizialmente solo il primo bottone ("Informazioni") deve essere attivo.
    competitionInfoBtn.classList.add('active')
    hideAllMainContainers(competitionPageName)
    document.getElementById('competitionInformation').style.display="flex"

    //questa parte è dedicata alla gestione dei bottoni per la singola partita (Informazioni, Eventi, Formazioni)
    //in particolare per mostrare il giusto container in base a quale bottone viene cliccato

    matchButtons = document.querySelectorAll('.match-details-navbar > button')
    matchButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            let containerName = button.getAttribute('data-showContainer')
            let containerToShow = document.getElementById(containerName)
            hideMatchContainersExceptOne(containerToShow)
            //ora rendiamo il bottone l'unico "attivo"
            matchButtons.forEach(btn=>{btn.classList.remove('button-game-navbar-active')})
            button.classList.add('button-game-navbar-active')
        })
    })
})

function hideMatchContainersExceptOne(containerToShow) {
    let matchContainers= document.querySelectorAll('#match-details-container > div')
    matchContainers.forEach(container=>{container.style.display="none"})
    containerToShow.style.display="flex"
}