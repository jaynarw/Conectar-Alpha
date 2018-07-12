function getMovies(searchText){
  axios.get('http://www.omdbapi.com/?apikey=e5f975a0&s='+searchText)
    .then((response) => {
      console.log(response);
      let movies = response.data.Search;
      let output = '';
      $.each(movies, (index, movie) => {
        output += `
          <div class="col-md-6 text-center" style="background:#D6EAF8;margin-top:10px;margin-bottom:10px;">
            <div class="text-center">
              <img src="${movie.Poster}" style="height:100px;width:100px;border-radius:10px;margin:10px;">
              <h5 style="color:Black;">${movie.Title}</h5>
              <a onclick="movieSelected('${movie.imdbID}')" class="btn btn-primary text-center" style="width:50%;margin-bottom:3%;"  href="/visit">Visit</a>
            </div>
          </div>
        `;
      });

      $('#movies').html(output);
    })
    .catch((err) => {
      console.log(err);
    });
}

function movieSelected(id){
  sessionStorage.setItem('movieId', id);
  window.location = 'visit.html';
  return false;
}

function getMovie(){
  let movieId = sessionStorage.getItem('movieId');

  axios.get('http://www.omdbapi.com/?apikey=e5f975a0&i='+movieId)
    .then((response) => {
      console.log(response);
      let movie = response.data;

      let output =`
        <div class="col-md-12 row">
          <div class="col-md-4">
            <img src="${movie.Poster}" class="thumbnail" style="height:100%;border-radius:10px;">
          </div>
          <div class="col-md-8">
            <h2 style="color:Black;">${movie.Title}</h2>
            <ul class="list-group">
              <li class="list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>
              <li class="list-group-item"><strong>Released:</strong> ${movie.Released}</li>
              <li class="list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>
              <li class="list-group-item"><strong>IMDB Rating:</strong> ${movie.imdbRating}</li>
              <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
              <li class="list-group-item"><strong>Writer:</strong> ${movie.Writer}</li>
              <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
              <li class="list-group-item"><strong>Production:</strong> ${movie.Production}</li>
            </ul>
            <a href="/" class="btn btn-danger">Go Back To Search</a>
          </div>
        </div>
      `;

      $('#movie').html(output);
    })
    .catch((err) => {
      console.log(err);
    });
}
