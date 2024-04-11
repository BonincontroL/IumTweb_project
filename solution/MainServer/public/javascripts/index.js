//questo JS è per le funzioni comuni
let competitionLogoImgUrl = "https://tmssl.akamaized.net/images/logo/header/"
let clubLogoImgURL = "https://tmssl.akamaized.net/images/wappen/head/"

function manageLateralButtons(lateralButtons){
    lateralButtons.forEach(btn=>{
        btn.addEventListener('click',function (){
            lateralButtons.forEach(button=>{
                button.classList.remove('active')
                let btnLogo=button.querySelector('img')
                let btnLogoNewSrc =btnLogo.src.replace("Active","")
                btnLogo.setAttribute('src',btnLogoNewSrc)
            })
            this.classList.add('active')
            let btnLogo = this.querySelector('img')
            let btnLogoSrc= btnLogo.getAttribute('src').split('.')[0]
            btnLogoSrc+='Active.svg'
            btnLogo.setAttribute('src',btnLogoSrc)
        })
    })
}

function hideAllMainContainers(pageName){
    const mainContainers=document.querySelectorAll(`#${pageName} .main-container`)
    mainContainers.forEach(container=>{container.style.display="none"})
}

function setCompetitionsCardEventListener(competitionCards){
    competitionCards.forEach(card => {
        card.addEventListener('click', () => {
            let competition_id = card.getAttribute('data-competitionId')
            window.location.href = "../competition_page.html?competition_id=" + competition_id
        })
    })
}