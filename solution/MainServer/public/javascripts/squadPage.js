let lateralSquadButtons, squadInfoBtn
const squadPageName= 'squad-page'
let clubId
document.addEventListener('DOMContentLoaded',()=>{
    const queryString= window.location.search
    const urlParam= new URLSearchParams(queryString)
    clubId= urlParam.get('club_id')

    const clubInfo={
        clubId:clubId,
        name :urlParam.get('name'),
        stadium:{
            stadiumName:urlParam.get('stadiumName'),
            stadiumSeats:urlParam.get('stadiumSeats')
        }
    }
    renderBasicInfo(clubInfo)
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

function renderBasicInfo(clubInfo) {
    document.getElementById('clubName').innerText = clubInfo.name
    document.getElementById('clubImage').setAttribute('src', `${clubLogoImgURL}${clubInfo.clubId}.png`)
}