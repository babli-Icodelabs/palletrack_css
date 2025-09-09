// SkeletonCard.js
import React from 'react';
import css from './FeaturedListings.module.css';
import classNames from 'classnames';

const SkeletonCard = () => {
    return (
        <article className={classNames(css.card, css.skeleton)}>
            <div className={css.imageWrap}>
                <div className={css.skeletonBox}></div>
            </div>
            <div className={css.cardBody}>
                <div className={css.skeletonLine} style={{ width: '40%' }}></div>
                <div className={css.skeletonLine} style={{ width: '70%' }}></div>
                <div className={css.skeletonLine} style={{ width: '50%' }}></div>
            </div>
        </article>
    );
};

export default SkeletonCard;
