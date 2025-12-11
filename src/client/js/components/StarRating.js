/**
 * Star Rating Component
 */

class StarRating {
  constructor(containerId, initialRating = 0, onRate = null) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.rating = initialRating;
    this.onRate = onRate;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.className = 'star-rating';

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('span');
      star.className = `star ${i <= this.rating ? 'active' : ''}`;
      star.textContent = '⭐';
      star.onclick = () => this.setRating(i);
      this.container.appendChild(star);
    }
  }

  setRating(rating) {
    this.rating = rating;
    this.render();

    if (this.onRate) {
      this.onRate(rating);
    }
  }

  getRating() {
    return this.rating;
  }
}

