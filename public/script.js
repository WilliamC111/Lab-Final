const socket = io();

socket.on('update-top10', (top10) => {
  const list = document.getElementById('top10-list');
  list.innerHTML = '';
  top10.forEach(([movieId, count]) => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const poster = document.createElement('img');
    poster.src = `https://via.placeholder.com/150x200?text=Movie+${movieId}`;
    poster.alt = `Movie ${movieId}`;
    poster.className = 'movie-poster';

    const title = document.createElement('div');
    title.className = 'movie-title';
    title.textContent = `Movie ${movieId}`;

    const views = document.createElement('div');
    views.className = 'movie-views';
    views.textContent = `${count} views`;

    card.appendChild(poster);
    card.appendChild(title);
    card.appendChild(views);
    list.appendChild(card);
  });
});
