// app.js

/* ------------------------ */
/* Calendar Functionality */
/* ------------------------ */

// Calendar Variables
const calendarGrid = document.getElementById('calendar-grid');
const monthYear = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const loadCalendar = () => {
  // Clear existing days but keep day labels
  calendarGrid.innerHTML = `
    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
  `;

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Set month and year in header
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];
  monthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;

  // Add blank days for alignment
  for (let i = 0; i < firstDayOfMonth; i++) {
    const blankDiv = document.createElement('div');
    blankDiv.classList.add('empty-day');
    calendarGrid.appendChild(blankDiv);
  }

  // Add days of the month
  for (let day = 1; day <= lastDateOfMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = day;
    dayDiv.classList.add('calendar-day');

    // Highlight if there's an itinerary
    const itineraries = JSON.parse(localStorage.getItem('itineraries')) || [];
    const itineraryOnDay = itineraries.find(itinerary => {
      const startDate = new Date(itinerary.startDate);
      return startDate.getDate() === day && startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
    });

    if (itineraryOnDay) {
      dayDiv.style.backgroundColor = '#2a9d8f';
      dayDiv.style.color = 'white';
    }

    calendarGrid.appendChild(dayDiv);
  }
};

// Previous & Next Month Buttons
prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  loadCalendar();
});

nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  loadCalendar();
});

// Initial load
loadCalendar();

/* ------------------------ */
/* Itinerary Modal Functionality */
/* ------------------------ */

// Get modal elements
const itineraryModal = document.getElementById('itinerary-modal');
const addItineraryBtn = document.getElementById('add-itinerary-btn');
const closeBtn = document.querySelector('.close-btn');
const itineraryForm = document.getElementById('itinerary-form');
const itineraryList = document.getElementById('itinerary-list');

// Open modal
addItineraryBtn.addEventListener('click', () => {
  itineraryModal.style.display = 'block';
});

// Close modal
closeBtn.addEventListener('click', () => {
  itineraryModal.style.display = 'none';
});

// Close modal when clicking outside of content
window.addEventListener('click', (e) => {
  if (e.target == itineraryModal) {
    itineraryModal.style.display = 'none';
  }
});

// Format date function
const formatDate = (dateString) => {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Handle form submission
itineraryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get form values
  const destination = document.getElementById('destination').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;

  // Create itinerary object
  const itinerary = { destination, startDate, endDate };

  // Save to localStorage
  const itineraries = JSON.parse(localStorage.getItem('itineraries')) || [];
  itineraries.push(itinerary);
  localStorage.setItem('itineraries', JSON.stringify(itineraries));

  // Update UI
  displayItineraries();
  loadCalendar();

  // Reset form and close modal
  itineraryForm.reset();
  itineraryModal.style.display = 'none';
});

// Display itineraries
const displayItineraries = () => {
  itineraryList.innerHTML = '';
  const itineraries = JSON.parse(localStorage.getItem('itineraries')) || [];

  itineraries.forEach((itinerary, index) => {
    const card = document.createElement('div');
    card.classList.add('itinerary-card');

    const title = document.createElement('h3');
    title.textContent = itinerary.destination;

    const dates = document.createElement('p');
    dates.textContent = `${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Delete';
    removeBtn.addEventListener('click', () => {
      itineraries.splice(index, 1);
      localStorage.setItem('itineraries', JSON.stringify(itineraries));
      displayItineraries();
      loadCalendar();
    });

    card.appendChild(title);
    card.appendChild(dates);
    card.appendChild(removeBtn);

    itineraryList.appendChild(card);
  });

  // Update trip stats
  const today = new Date();
  const upcomingTrips = itineraries.filter(itinerary => new Date(itinerary.startDate) >= today).length;
  const completedTrips = itineraries.filter(itinerary => new Date(itinerary.endDate) < today).length;

  document.getElementById('total-trips').textContent = itineraries.length;
  document.getElementById('upcoming-trips').textContent = upcomingTrips;
  document.getElementById('completed-trips').textContent = completedTrips;
};

// Initial display of itineraries
displayItineraries();

/* ------------------------ */
/* Packing List Functionality */
/* ------------------------ */

// Packing List Variables
const addItemBtn = document.getElementById('add-item-btn');
const packingItemInput = document.getElementById('packing-item');
const packingItemsList = document.getElementById('packing-items');

// Handle adding a packing item
addItemBtn.addEventListener('click', () => {
  const item = packingItemInput.value.trim();
  if (item !== '') {
    // Get existing items from localStorage
    const packingItems = JSON.parse(localStorage.getItem('packingItems')) || [];
    // Add the new item
    packingItems.push(item);
    // Save back to localStorage
    localStorage.setItem('packingItems', JSON.stringify(packingItems));
    // Update UI
    displayPackingItems();
    // Clear input
    packingItemInput.value = '';
  }
});

// Display packing items
const displayPackingItems = () => {
  packingItemsList.innerHTML = '';
  const packingItems = JSON.parse(localStorage.getItem('packingItems')) || [];
  packingItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      packingItems.splice(index, 1);
      localStorage.setItem('packingItems', JSON.stringify(packingItems));
      displayPackingItems();
    });

    li.appendChild(removeBtn);
    packingItemsList.appendChild(li);
  });
};

// Initial display of packing items
displayPackingItems();

// Get dark mode toggle checkbox
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Load dark mode preference from localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
  document.body.classList.add('dark-mode');
  darkModeToggle.checked = true;
}

// Toggle dark mode
darkModeToggle.addEventListener('change', () => {
  if (darkModeToggle.checked) {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});
