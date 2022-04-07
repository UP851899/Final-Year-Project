window.addEventListener('load', () => {
  if (window.location.href.indexOf('blocking.html') > -1) {
    loadFilters();
    loadBlocklist();
  }
});

// Load Filters onto webpage from DB
async function loadFilters() {
  let filterFetch;
  const ul = document.getElementById('filter-list');

  filterFetch = await fetch('/filters');
  if (filterFetch.ok) {
    filterFetch = await filterFetch.json();
  } else {
    console.log('filterFetch failed');
    filterFetch = undefined;
  }

  for (const i of filterFetch) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(i));
    ul.appendChild(li);
  }
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
