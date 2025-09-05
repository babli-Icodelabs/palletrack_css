import React, { useState } from 'react';
import { compose } from 'redux';
import { useIntl } from 'react-intl';
import { bool, object } from 'prop-types';
import { connect } from 'react-redux';

import loadable from '@loadable/component';
import { Modal } from '../../components';

import { camelize } from '../../util/string';
import { propTypes } from '../../util/types';

import FallbackPage from './FallbackPage';
import { ASSET_NAME } from './LandingPage.duck';

import { manageDisableScrolling } from '../../ducks/ui.duck';
import ContactUsForm from './ContactUsForm';

const PageBuilder = loadable(() =>
  import(/* webpackChunkName: "PageBuilder" */ '../PageBuilder/PageBuilder')
);

export const LandingPageComponent = props => {
  const { pageAssetsData, inProgress, error, onManageDisableScrolling } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const intl = props.intl || useIntl();

  const handleOpen = () => setIsModalOpen(true);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const onSubmit = values => {
    console.log('Form submitted:', values);
    handleClose();
  };

  return (
    <>
      <PageBuilder
        pageAssetsData={pageAssetsData?.[camelize(ASSET_NAME)]?.data}
        inProgress={inProgress}
        error={error}
        fallbackPage={<FallbackPage error={error} />}
        handleOpen={handleOpen}
        handleClose={handleClose}
      />
      {/* contact-us modal */}
      <Modal
        id="contactUs"
        isOpen={isModalOpen}
        onClose={() => {
          handleClose()
        }}
        usePortal
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <ContactUsForm
          onSubmit={onSubmit}
          intl={intl}
        />
      </Modal>
      {/* end */}
    </>
  );
};

LandingPageComponent.propTypes = {
  pageAssetsData: object,
  inProgress: bool,
  error: propTypes.error,
};

const mapStateToProps = state => {
  const { pageAssetsData, inProgress, error } = state.hostedAssets || {};
  return { pageAssetsData, inProgress, error };
};

const mapDispatchToProps = dispatch => ({
  onManageDisableScrolling: (componentId, disableScrolling) =>
    dispatch(manageDisableScrolling(componentId, disableScrolling))
});

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(connect(mapStateToProps, mapDispatchToProps))(LandingPageComponent);

export default LandingPage;
