window.addEventListener('DOMContentLoaded', async () => {
  if (window.location.href.indexOf('blocking.html') > -1) {
    await loadFilters();
    await loadBlocklist();
    addRowHandlers();
    document.getElementById('blocking').style.fontWeight = '700';
  }
});

// Load Filters onto webpage from DB
async function loadFilters() {
  const filterFetch = await fetchFilters();
  const filterSelect = document.getElementById('filter');
  const filterSelectUpdate = document.getElementById('filter-update');
  const ul = document.getElementById('filter-list');

  for (const i of filterFetch) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(i));
    ul.appendChild(li);

    // Add to 'add website modal' select option
    const newOption = document.createElement('option');
    newOption.value = i;
    newOption.text = i;
    filterSelect.add(newOption, null);
    filterSelectUpdate.add(newOption, null);
  }
}

// Function to return list of filters
async function fetchFilters() {
  let filterFetch = await fetch('/filters');
  if (filterFetch.ok) {
    filterFetch = await filterFetch.json();
  } else {
    console.log('filterFetch failed');
    filterFetch = undefined;
  }

  return filterFetch;
}

// Load blockList and corresponding filter from DB
async function loadBlocklist() {
  let blocklistFetch;
  blocklistFetch = await fetch('/websites');
  if (blocklistFetch.ok) {
    blocklistFetch = await blocklistFetch.json();
  } else {
    console.log('blocklistFetch failed');
    blocklistFetch = undefined;
  }

  const blockTable = document.getElementById('block-table');
  for (const i of blocklistFetch) {
    // addToTable(i.address, i.filter);
    const newRow = document.createElement('tr');

    newRow.appendChild(document.createElement('td'));
    newRow.appendChild(document.createElement('td'));

    newRow.cells[0].appendChild(document.createTextNode(i.address));
    newRow.cells[1].appendChild(document.createTextNode(i.filter));

    blockTable.appendChild(newRow);
  }
}

// Add website modal

const websiteModal = document.getElementsByClassName('add-Website-Modal');
const addSiteButton = document.getElementById('add-site-btn');
const spanWebAdd = document.getElementsByClassName('close-add')[0];

const saveWebsite = document.getElementById('submit-website-add');
const cancelWebsite = document.getElementById('close-website-add');
const filterSelect = document.getElementById('filter');
const websiteInput = document.getElementById('website');

addSiteButton.onclick = () => {
  websiteModal[0].style.display = 'block';
};

spanWebAdd.onclick = () => {
  websiteModal[0].style.display = 'none';
  websiteInput.value = '';
  filterSelect.value = 'null';
};

cancelWebsite.onclick = () => {
  websiteModal[0].style.display = 'none';
  websiteInput.value = '';
  filterSelect.value = 'null';
};

saveWebsite.onclick = () => {
  const websiteInputted = websiteInput.value;
  const filterIndex = filterSelect.selectedIndex;

  websiteModal[0].style.display = 'none'; // Close modal on save

  const object = { website: websiteInputted, id: filterIndex };
  console.log(object);

  fetch('/newWebsite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(object),
  });

  websiteInput.value = ''; // sets user input string to blank
  filterSelect.value = 'null'; // sets selection to default
};

// Add filter modal

const filterModal = document.getElementsByClassName('add-Filter-Modal');
const addFilterButton = document.getElementById('add-filter-btn');
const spanFilterAdd = document.getElementsByClassName('close-filter')[0];

const saveFilter = document.getElementById('submit-filter-add');
const cancelFilter = document.getElementById('close-filter-add');
const filterInput = document.getElementById('filter-input');

addFilterButton.onclick = () => {
  filterModal[0].style.display = 'block';
};

spanFilterAdd.onclick = () => {
  filterModal[0].style.display = 'none';
  filterInput.value = '';
};

cancelFilter.onclick = () => {
  filterModal[0].style.display = 'none';
  filterInput.value = '';
};

saveFilter.onclick = () => {
  const filterInputted = filterInput.value;
  console.log(filterInputted);

  const object = { filter: filterInputted };
  console.log(object);

  fetch('/newFilter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(object),
  });

  filterInput.value = '';
};

// Edit website Modal
const editButton = document.getElementById('edit-site-btn');
const editModal = document.getElementsByClassName('edit-Website-Modal');
const spanEdit = document.getElementsByClassName('close-edit')[0];

const updateSite = document.getElementById('submit-website-update');
const cancelUpdate = document.getElementById('close-website-update');
const filterUpdate = document.getElementById('filter-update');
const websiteUpdate = document.getElementById('website-edit');

editButton.onclick = () => {
  if (selectedArray.length === 0) { // If object is empty, you cannot edit
    alert('Please select a website to edit');
  } else { // If there is a selection, edit will open
    console.log(selectedArray);
    editModal[0].style.display = 'block';
    // const objectString = JSON.stringify(selectedArray.address.replace(/"([^"]+)":/g, '$1:'));
    // console.log(objectString);
    websiteUpdate.value = selectedArray[0];
  }
};

spanEdit.onclick = () => {
  editModal[0].style.display = 'none';
};

cancelUpdate.onclick = () => {
  editModal[0].style.display = 'none';
};

// Select row in website table

let selectedArray = [];

function addRowHandlers() {
  const table = document.getElementById('block-table');
  console.log(table.rows.length);
  const rows = table.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    const currentRow = table.rows[i];
    const createClickHandler =
      function (row) {
        return function () {
          // row.classList.remove('selected');
          if (row.classList.contains('selected')) {
            console.log('unselected');
            unselectRows();
            selectedArray = [];
          } else {
            unselectRows();
            console.log('selected');
            const cell = row.getElementsByTagName('td')[0];
            const website = cell.innerHTML;
            row.classList.add('selected');
            selectedArray = [website];
          }
        };
      };

    currentRow.onclick = createClickHandler(currentRow);
  }
}

function unselectRows() {
  const table = document.getElementById('block-table');
  const rows = table.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    rows[i].classList.remove('selected');
  }
}
