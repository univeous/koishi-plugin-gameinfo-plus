
const parser = new DOMParser()

function dateToYMD(date) {
    var d = date.getDate()
    var m = date.getMonth() + 1 //Month from 0 to 11
    var y = date.getFullYear()
    return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
}

function processPriceTable(priceData){

    for (const price of priceData) {
        if(price.platform_id == 0) continue
        
        const tr = document.createElement('tr')
        let iconPath = "./assets/"

        switch (price.platform_id) {
            case 999:
                iconPath = iconPath + 'steam.svg'
                break
            case 998:
                iconPath = iconPath + "epic.svg"
                break
            case 2: //XONE
            case 10: //XSX|S
                iconPath = iconPath + "xbox.svg"
                break
            case 1:
               iconPath = iconPath + "ps4.svg"
                break
            case 8:
                iconPath = iconPath + "ps5.svg"
                break
            case 7:
                iconPath =  iconPath + "ns.svg"
                break
            default:
                break
        }

        const icon = document.createElement('img')
        icon.setAttribute('class', 'icon')
        icon.setAttribute('src', iconPath)

        const th1 = document.createElement('th')
        th1.appendChild(icon)
        tr.appendChild(th1)

        const historyPrice = document.createElement('th')
        historyPrice.innerHTML = price.history_price
        tr.appendChild(historyPrice)

        const currentPrice = document.createElement('th')
        if(price.price === price.origin_price)
            currentPrice.innerHTML = price.price
        else{
            currentPrice.innerHTML = `<s>${price.origin_price}</s> <div class="off">${price.price}</div> `
        }
        tr.appendChild(currentPrice)

        document.querySelector('.price-table').appendChild(tr)
    }
}

function repos(){
    const headerImage = document.querySelector(".header")
    const title = document.querySelector("#game-title")
    title.style.top = `${headerImage.clientHeight - title.clientHeight - 40}px`
}

function action(raw_data) {
    const data = raw_data.combine_game

    const headerImage = document.querySelector(".header")
    headerImage.setAttribute('src', data.img)

    const title = document.querySelector("#game-title")
    title.innerHTML = data.name
    document.querySelector(".desc").innerHTML = data.desc

    let formattedDate = "TBA"
    if (data.release_date) {
        const date = new Date(data.release_date)
        formattedDate = dateToYMD(date)
    }

    document.querySelector(".release-date-text").innerHTML = formattedDate

    const priceTable = document.querySelector(".price-table")
    if (!data.price_detail) priceTable.parentNode.removeChild(priceTable)
    else {
        processPriceTable(data.price_detail)
    }

    const tagsGroup = document.querySelector(".tags-group")
    if(data.tag){
        const tags = data.tag.split(',')
        for(const tag of tags)
        {
            const tagElement = document.createElement('div')
            tagElement.setAttribute('class', 'tag')
            tagElement.innerHTML = tag
            tagsGroup.appendChild(tagElement)
        }
    } else {
        tagsGroup.parentNode.removeChild(tagsGroup)
    }
}

