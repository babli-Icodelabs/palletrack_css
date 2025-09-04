import React from 'react';
import cardImage from '../../assets/cardImage1.png'

import css from './FeatureOfTheWeek.module.css';
const FeatureOfTheWeek = () => {
    return (
        <section className={css.featureOfTheWeek}>
            <div className={css.sectionIntro}>
                <h2 className={css.kickerTitle}>Feature of the week</h2>
                <p className={css.subtitle}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>

            <div className={css.contentGrid}>
                <div className={css.leftCol}>
                    <h3 className={css.leftTitle}>Feature of the week</h3>
                    <p className={css.leftParagraph}>
                        Lorem Ipsum Dolor Sit Amet, Consectetur Adipiscing Elit. Sed Do Eiusmod Tempor
                        Incididunt Ut Labore Et Dolore Magna Aliqua. Excepteur Sint Occaecat Cupidatat
                        Non Proident, Sunt In Culpa Qui Officia Deserunt Mollit Anim Id Est Laborum
                    </p>
                    <button className={css.ctaButton}>View more</button>
                </div>

                <article className={css.card}>
                    <img
                        className={css.cardImage}
                        src={cardImage}
                        alt="Feature of the week"
                    />
                    <div className={css.cardBody}>
                        <p className={css.price}>$400</p>
                        <h4 className={css.productTitle}>Wire Mesh Decking – Bundle of 25</h4>
                        <p className={css.meta}>STEEL KING | 48"W X 192"H</p>
                    </div>
                </article>
            </div>
        </section>
    );
};

export default FeatureOfTheWeek;