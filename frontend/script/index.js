window.addEventListener('load', () => {
  if (window.location.href.indexOf('blocking.html') > -1) {
    loadFilters();
    loadBlocklist();
    document.getElementById('blocking').style.fontWeight = '700';
  }
});

// Load Filters onto webpage from DB
async function loadFilters() {
  const filterFetch = await fetchFilters();
  const filterSelect = document.getElementById('filter-select');
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

  for (const i of blocklistFetch) {
    addToTable(i.address, i.filter);
  }
}

// Add new rows to table from loadBlocklist
function addToTable(website, filter) {
  const blockTable = document.getElementById('block-table');

  const newRow = blockTable.insertRow(1);
  const cellOne = newRow.insertCell(0);
  const cellTwo = newRow.insertCell(1);

  cellOne.innerHTML = website;
  cellTwo.innerHTML = filter;
}

// Add website modal

const websiteModal = document.getElementsByClassName('add-Website-Modal');
const button = document.getElementById('add-site-btn');
const span = document.getElementsByClassName('close-add')[0];

const saveWebsite = document.getElementById('submit-website-add');
const cancelWebsite = document.getElementById('close-website-add');
const filterSelect = document.getElementById('filter-select');
const websiteInput = document.getElementById('website-input');

button.onclick = () => {
  websiteModal[0].style.display = 'block';
};

span.onclick = () => {
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
  const filterSelected = filterSelect.value;
  const filterIndex = filterSelect.selectedIndex

  // Add database push
  console.log(filterSelected);
  console.log(websiteInputted);
  console.log(filterIndex);

  websiteModal[0].style.display = 'none'; // Close modal on save

  const object = { website: websiteInput, id: filterIndex };
  console.log(object);

  websiteInput.value = '';
  filterSelect.value = 'null';
};
