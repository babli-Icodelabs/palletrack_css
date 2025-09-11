import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { useHistory } from 'react-router-dom';

import cardImage1 from '../../assets/cardImage1.png';
import cardImage2 from '../../assets/cardImage2.png';
import cardImage3 from '../../assets/cardImage3.png';
import cardImage4 from '../../assets/cardImage4.png';

import { fetchFeaturedListings, toggleFavorite } from './FeaturedListing.duck';
import { fetchCurrentUser } from '../../ducks/user.duck';

import SkeletonCard from './SkeletonCard';

import css from './FeaturedListings.module.css';
import IconCard from '../SavedCardDetails/IconCard/IconCard';

const FeaturedListings = (props) => {
  const {
    featuredListings,
    currentUser,
    onToggleFavorite,
    loading
  } = props;
  const history = useHistory()
  const trackRef = React.useRef(null);
  const favoriteIds = currentUser?.attributes?.profile?.publicData?.favorites || [];

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

  const handleFavoriteClick = (listingId, isFav) => {
    if (currentUser) {
      onToggleFavorite(listingId, isFav);
    } else {
      history.push('/signup')
    }
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
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : items.map(item => {
              const isFav = favoriteIds.includes(item.id);
              return <article
                className={classNames(css.card, item.tag ? css.preSale : '')}
                key={item.id}
              >
                <div className={css.imageWrap}>
                  {item.tag ? <span className={css.tag}>{item.tag}</span> : null}
                  <img className={css.image} src={item.image} alt={item.title} />
                  <button className={css.wishBtn} aria-label="Save" onClick={() => handleFavoriteClick(item.id, !isFav)}>
                    <IconCard brand="heart" filled={isFav} />
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
            })}
        </div>
        <button
          aria-label="Next"
          className={css.navBtn}
          onClick={() => scrollByCards(1)}
        >
          ›
        </button>
      </div>
    </section >
  );
};

const mapStateToProps = state => {
  const {
    featuredListings,
    fetchFeaturedInProgress,
  } = state.FeaturedListings || {};
  const { currentUser } = state.user;
  return {
    listings: featuredListings || [],
    currentUser,
    loading: fetchFeaturedInProgress,
  };
};

const mapDispatchToProps = dispatch => ({
  onFetchFeaturedListings: () => dispatch(fetchFeaturedListings()),
  onFetchCurrentUser: () => dispatch(fetchCurrentUser()),
  onToggleFavorite: (id, isFav) => dispatch(toggleFavorite(id, isFav)),
});

export default connect(mapStateToProps, mapDispatchToProps)(FeaturedListings);
