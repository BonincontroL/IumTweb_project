let lateralButtons
document.addEventListener('DOMContentLoaded',()=>{
    let competitionInfoBtn= document.getElementById('competition-info-btn')
    lateralButtons = document.querySelectorAll('#competitionLateralNavbar .lateral-menu-button')
    lateralButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            hideAllMainContainers('competition-page')
            let containerToShow = button.getAttribute('data-showContainer')
            document.getElementById(containerToShow).style.display="flex"
        })
    })
    manageLateralButtons(lateralButtons)
    //inizialmente solo il primo bottone ("Informazioni") deve essere attivo.
    competitionInfoBtn.classList.add('active')
    hideAllMainContainers('competition-page')
    document.getElementById('competitionInformation').style.display="flex"

})