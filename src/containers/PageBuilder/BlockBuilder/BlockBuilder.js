import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

// Block components
import BlockDefault from './BlockDefault';
import BlockFooter from './BlockFooter';
import BlockSocialMediaLink from './BlockSocialMediaLink';
import { Button } from '../../../components';
import { createResourceLocatorString } from '../../../util/routes';
import { useRouteConfiguration } from '../../../context/routeConfigurationContext';

///////////////////////////////////////////
// Mapping of block types and components //
///////////////////////////////////////////

const defaultBlockComponents = {
  defaultBlock: { component: BlockDefault },
  footerBlock: { component: BlockFooter },
  socialMediaLink: { component: BlockSocialMediaLink },
};

////////////////////
// Blocks builder //
////////////////////

/**
 * @typedef {Object} BlockConfig
 * @property {string} blockId
 * @property {string} blockName
 * @property {'defaultBlock' | 'footerBlock' | 'socialMediaLink'} blockType
 */

/**
 * @typedef {Object} FieldComponentsConfig
 * @property {ReactNode} component
 * @property {Function} pickValidProps
 */

/**
 * @typedef {Object} BlockComponentConfig
 * @property {ReactNode} component
 */

/**
 * This returns an array of Block components from given block config array.
 *
 * @component
 * @param {Object} props
 * @param {Array<BlockConfig>} props.blocks - array of block configs
 * @param {Object} props.options extra options for the block component (e.g. custom fieldComponents)
 * @param {Object<string,FieldComponentsConfig>?} props.options.fieldComponents extra options for the block component (e.g. custom fieldComponents)
 * @param {Object<string,BlockComponentConfig>?} props.options.blockComponents extra options for the block component (e.g. custom fieldComponents)
 * @param {string?} props.responsiveImageSizes
 * @param {string?} props.sectionId
 * @param {string?} props.className add more style rules in addition to components own css.root
 * @param {string?} props.rootClassName overwrite components own css.root
 * @param {string?} props.className add more styles in addition to components own css.root
 * @param {string?} props.mediaClassName add styles for the block's attached media field
 * @param {string?} props.textClassName add styles for the block's attached text field
 * @param {string?} props.ctaButtonClass add styles for the block's attached CTA field
 * @param {Object?} props.params - path params for the named route and its pathname prop
 * @returns {JSX.Element} containing form that allows adding availability exceptions
 */
const BlockBuilder = props => {
  const { blocks = [], sectionId, options, history, isAuthenticated, ...otherProps } = props;

  const routeConfiguration = useRouteConfiguration();


  // Extract block & field component mappings from props
  // If external mapping has been included for fields
  // E.g. { h1: { component: MyAwesomeHeader } }
  const { blockComponents, fieldComponents } = options || {};
  const blockOptionsMaybe = fieldComponents
    ? { options: { fieldComponents } }
    : {};

  // If there's no block, we can't render the correct block component
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Handle button click based on authentication status
  const handleButtonClick = (action) => {
    if (!isAuthenticated) {
      // Redirect unauthenticated users to signup
      const signupPath = createResourceLocatorString('SignupPage', routeConfiguration, {}, {});
      history.push(signupPath);
      return;
    }

    let path = '';

    switch (action) {
      case 'list':
      case 'sell':
        path = createResourceLocatorString('EditListingPage', routeConfiguration, {
          slug: 'slug',
          id: '000-000-000',
          type: 'new',
          tab: 'details',
        }, {});
        break;

      case 'search':
      case 'find': // if find should also go to search
        path = createResourceLocatorString('SearchPage', routeConfiguration, {}, {});
        break;

      case 'connect':
        path = createResourceLocatorString('InboxPage', routeConfiguration, { tab: 'orders' }, {});
        break;

      case 'buy':
        path = createResourceLocatorString('CartPage', routeConfiguration, {}, {});
        break;

      default:
        path = '/'; // fallback route
    }

    history.push(path);
  };


  // Selection of Block components
  // Combine component-mapping from props together with the default one:
  const components = { ...defaultBlockComponents, ...blockComponents };

  return (
    <>
      {blocks.map((block, index) => {
        const config = components[block.blockType];
        const Block = config?.component;
        const blockId = block.blockId || `${sectionId}-block-${index + 1}`;
        if (blockId === 'three_steps-block-2') {
          return (
            <div key={`${blockId}_i${index}`}>
              <Button type="button" onClick={() => handleButtonClick('search')}>SEARCH</Button>
              <Button type="button" onClick={() => handleButtonClick('find')}>FIND</Button>
              <Button type="button" onClick={() => handleButtonClick('buy')}>BUY</Button>
            </div>
          );
        } else if (blockId === 'three_steps-block-3') {
          return (
            <div key={`${blockId}_i${index}`}>
              <Button type="button" onClick={() => handleButtonClick('list')}>LIST</Button>
              <Button type="button" onClick={() => handleButtonClick('connect')}>CONNECT</Button>
              <Button type="button" onClick={() => handleButtonClick('sell')}>SELL</Button>
            </div>
          );
        } else if (Block) {
          return (
            <Block
              key={`${blockId}_i${index}`}
              {...block}
              blockId={blockId}
              {...blockOptionsMaybe}
              {...otherProps}
            />
          );
        } else {
          // If the block type is unknown, the app can't know what to render
          console.warn(
            `Unknown block type (${block.blockType}) detected inside (${sectionId}).`
          );
          return null;
        }
      })}
    </>
  );
};

const mapStateToProps = state => {
  const { isAuthenticated } = state.auth;
  return { isAuthenticated };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
export default compose(
  withRouter,
  connect(mapStateToProps)
)(BlockBuilder);
