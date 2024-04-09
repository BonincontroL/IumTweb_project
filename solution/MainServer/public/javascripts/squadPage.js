let lateralSquadButtons, squadInfoBtn
const squadPageName= 'squad-page'
document.addEventListener('DOMContentLoaded',()=>{
    squadInfoBtn= document.getElementById('squad-info-btn')
    lateralSquadButtons=document.querySelectorAll('#squadLateralNavbar .lateral-menu-button')
    lateralSquadButtons.forEach(button=>{
        button.addEventListener('click',()=>{
            hideAllMainContainers(squadPageName)
            let containerToShow= button.getAttribute('data-showContainer')
            document.getElementById(containerToShow).style.display="flex"
        })
    })
    manageLateralButtons(lateralSquadButtons)
    //inizialmente solo il bottone Informazioni deve essere selezionato
    squadInfoBtn.classList.add('active')
    hideAllMainContainers(squadPageName)
    document.getElementById('squadInformation').style.display="flex"
})