import React from 'react';
import css from './FeaturedListings.module.css';
import cardImage1 from '../../assets/cardImage1.png';
import cardImage2 from '../../assets/cardImage2.png';
import cardImage3 from '../../assets/cardImage3.png';
import cardImage4 from '../../assets/cardImage4.png';
import classNames from 'classnames';

const FeaturedListings = () => {
  const trackRef = React.useRef(null);

  const items = [
    {
      id: '1',
      image: cardImage1,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
    {
      id: '2',
      image: cardImage2,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
    {
      id: '3',
      image: cardImage3,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: 'Pre-Sale',
    },
    {
      id: '4',
      image: cardImage3,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
    {
      id: '1',
      image: cardImage4,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
    {
      id: '2',
      image: cardImage1,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
    {
      id: '3',
      image: cardImage2,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: 'Pre-Sale',
    },
    {
      id: '4',
      image: cardImage3,
      price: '$400',
      title: 'Wire Mesh Decking – Bundle of 25',
      meta: 'STEEL KING  |  48"W X 192"H',
      tag: '',
    },
  ];

  const scrollByCards = direction => {
    const node = trackRef.current;
    if (!node) return;
    const card = node.querySelector(`.${css.card}`);
    const cardWidth = card ? card.getBoundingClientRect().width : 300;
    const gap = 24;
    node.scrollBy({ left: (cardWidth + gap) * direction, behavior: 'smooth' });
  };

  return (
    <section className={css.featuredListings}>
      <div className={css.header}>
        <h2 className={css.title}>Featured Listings</h2>
        <p className={css.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
      </div>

      <div className={css.slider}>
        <button
          aria-label="Previous"
          className={css.navBtn}
          onClick={() => scrollByCards(-1)}
        >
          ‹
        </button>
        <div className={css.track} ref={trackRef}>
          {items.map(item => (
            <article
              className={classNames(css.card, item.tag ? css.preSale : '')}
              key={item.id}
            >
              <div className={css.imageWrap}>
                {item.tag ? <span className={css.tag}>{item.tag}</span> : null}
                <img className={css.image} src={item.image} alt={item.title} />
                <button className={css.wishBtn} aria-label="Save">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 30 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12.5125 24.5848C8.9875 21.9473 2 15.9185 2 10.4923C2 6.90726 4.63125 3.99976 8.25 3.99976C10.125 3.99976 12 4.62476 14.5 7.12476C17 4.62476 18.875 3.99976 20.75 3.99976C24.3687 3.99976 27 6.90726 27 10.4923C27 15.9173 20.0125 21.9473 16.4875 24.5848C15.3 25.4723 13.7 25.4723 12.5125 24.5848Z"
                      stroke="#F06F2A"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <div className={css.cardBody}>
                <p className={css.price}>{item.price}</p>
                <h3 className={css.cardTitle}>{item.title}</h3>
                <p className={css.cardMeta}>{item.meta}</p>
                {item.tag ? (
                  <p className={css.availability}>AVAILABLE OCTOBER 2025</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        <button
          aria-label="Next"
          className={css.navBtn}
          onClick={() => scrollByCards(1)}
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default FeaturedListings;
