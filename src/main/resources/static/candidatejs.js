// Metode der laver rækkerne i tabellen.
function makeRows() {
    const rows = cache.getAll().map(c => `
         <tr>
           <td id="name-for-table">${c.name}</td>
           <td>${c.party}</td>
           <td>${c.votes}</td>
           <td>
           <button data-id-delete=${c.id} class="btn-danger" style="color: black" href="#">Slet</button>
           <button data-id-edit='${c.id}' class="btn-warning" style="color: black" href="#">Rediger</button> 
           </td>       
         </tr>
        `)
    document.getElementById("candidate-table-body").innerHTML = rows.join("")
}

function makeDatalist(){
    const unique = [...new Set(cache.getAll().map(candidate => candidate.party))];
    const startOption = `<option>Alle</option>`
    const rows = unique.map(a => ` 
        <option>${a}</option>
    `)
    document.getElementById("party-list").innerHTML = rows.join("")
    document.getElementById("parties").innerHTML = startOption+ rows.join("")
}
function partyVoteCounter(){
    let tempInfo = {}
    cache.getAll().forEach(function(candidate) {
        if (tempInfo.hasOwnProperty(candidate.party)) {
            tempInfo[candidate.party] = tempInfo[candidate.party] + candidate.votes;
        } else {
            tempInfo[candidate.party] = candidate.votes;
        }
    });
    console.log(tempInfo)
    let partyInformation = [];

    for (let prop in tempInfo) {
        console.log(prop)
        partyInformation.push({ name: prop, value: tempInfo[prop] });
    }
}

//METODE OVER LOCAL CACHE - INDEHOLDER FORSKELLIGE METODER
function localCache() {
    let data = []
    const addEdit = (candidate, method) => {
        if (method === "POST") {
            data.push(candidate)
        } else if (method === "PUT") {
            data = data.map(c => c.id == candidate.id ? candidate : c)
        }
    }
    return {
        getAll: () => data, //This is the same as above
        addAll: (all) => data = all,
        deleteOne: (id) => data = data.filter(c => c.id !== Number(id)),
        findById: (id) => data.find(c => c.id == id),
        addEdit: addEdit
    }
}

//SETUP-HANDLERS
function setUpHandlers() {
    document.getElementById("candidate-table-body").onclick = handleTableClick
    if (document.getElementById("btn-save-candidate") !== null)
        document.getElementById("btn-save-candidate").onclick = saveCandidate
    if (document.getElementById("btn-add-candidate") !== null)
        document.getElementById("btn-add-candidate").onclick = makeNewCandidate
    if(document.getElementById("parties") !== null){
        (document.getElementById("parties")).onchange = fetchPartyCandidates

    }
}

setUpHandlers()

//CLICK HANDLERS
function handleTableClick(evt) {
    console.log("Her er vi nu")
    evt.preventDefault()
    evt.stopPropagation()
    const target = evt.target;
    //data-id-delete
    if (target.dataset.idDelete) {
        const idToDelete = Number(target.dataset.idDelete)
        const options = {
            method: "DELETE",
            headers: {'Accept': 'application/json'},
        }
        fetch("api/candidates/" + idToDelete, options)
            .then(res => {
                if (res.ok) {
                    cache.deleteOne(idToDelete)
                    makeRows()
                }
            })
    }
    //EDIT
    if (target.dataset.idEdit) {
        const idToEdit = Number(target.dataset.idEdit)
        const candidate = cache.findById(idToEdit)
        showModal(candidate)
    }
    if(target.dataset.idGet){

    }
}

//TOM MODAL TIL AT LAVE NY ATTRACTION
function makeNewCandidate() {
    showModal({
        id: null,
        name: "",
        party: "",
        votes: ""

    })
}

//SHOW EKSISTERENDE MODAL
function showModal(candidate) {
    const myModal = new bootstrap.Modal(document.getElementById('candidate-modal'))
    document.getElementById("modal-title-candidate").innerText = candidate.id ? "Rediger kandidat" : "Tilføj kandidat"
    document.getElementById("candidate-id").innerText = candidate.id
    document.getElementById("input-name").value = candidate.name
    makeDatalist()
    document.getElementById("input-votes").value = candidate.votes
    myModal.show()
}


//GEM ATTRAKTION ALT EFTER OM DET ER EDIT ELLER SAVE
function saveCandidate() {
    const candidate = {}
    candidate.id = Number(document.getElementById("candidate-id").innerText)
    candidate.name = document.getElementById("input-name").value
    candidate.party = document.getElementById("party").value
    candidate.votes = document.getElementById("input-votes").value
    const method = candidate.id ? "PUT" : "POST"
    const url = (method === "PUT") ? "api/candidates/" + candidate.id : "api/candidates"
    const options = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(candidate)
    }
    fetch(url, options)
        .then(res => {
            if (!res.ok) {
                throw "Der var noget, som gik galt, tjek dine inputs"
            }
            return res.json()
        })
        .then(candidate => {
            debugger
            cache.addEdit(candidate, method)
            makeRows()
            window.location.replace("index.html")
        })
        .catch(e => alert(e))
}

//FETCH ALLE KANDIDATER
function fetchCandidates() {
    fetch("api/candidates")
        .then(res => res.json())
        .then(data => {
            //test med get i stedet 
            cache.addAll(data)
            makeRows()
            makeDatalist()
        })
}
function fetchPartyCandidates() {
    const party = document.getElementById("parties").value
    if(document.getElementById("parties").value === "Alle"){
        fetchCandidates()
    }else{
    fetch("api/candidates/party/"+party)
        .then(res => res.json())
        .then(data => {
            //test med get i stedet
            cache.addAll(data)
            makeRows()
        })
    }
}

const cache = localCache()
fetchCandidates()
partyVoteCounter()
