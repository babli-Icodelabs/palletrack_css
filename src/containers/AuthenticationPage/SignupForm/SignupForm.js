import React, { useState } from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { BUYER, DEALER, INSTALLER, propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput, CustomExtendedDataField, FieldLocationAutocompleteInput, FieldSelect, ImageFromFile, FieldCheckboxGroup, Button } from '../../../components';

import FieldSelectUserType from '../FieldSelectUserType';
import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';

import css from './SignupForm.module.css';
import { isUploadImageOverLimitError } from '../../../util/errors';
import { IconCollection } from '../../../components/IconCollection/IconCollection';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // S

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;
const identity = v => v;
const SignupFormComponent = props => {
  const [showRoleFields, setShowRoleFields] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [currentTab, setCurrentTab] = useState('initial');
  const [tab1DataShown, setTab1DataShown] = useState(false);

  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
      render={formRenderProps => {
        const {
          rootClassName,
          className,
          handleSubmit,
          inProgress,
          invalid,
          profileImage,
          intl,
          termsAndConditions,
          preselectedUserType,
          userTypes,
          userFields,
          values,
          form: formId,
          uploadImageError,
          uploadInProgress,
          onImageUpload,
          onRemoveImage,
          previewUrl
        } = formRenderProps;
        const { userType } = values || {};

        const addressRequiredMessage = intl.formatMessage({
          id: 'EditListingLocationForm.addressRequired',
        });
        const addressNotRecognizedMessage = intl.formatMessage({
          id: 'EditListingLocationForm.addressNotRecognized',
        });

        // email
        const emailRequired = validators.required(
          intl.formatMessage({
            id: 'SignupForm.emailRequired',
          })
        );
        const emailValid = validators.emailFormatValid(
          intl.formatMessage({
            id: 'SignupForm.emailInvalid',
          })
        );

        // password
        const passwordRequiredMessage = intl.formatMessage({
          id: 'SignupForm.passwordRequired',
        });
        const passwordMinLengthMessage = intl.formatMessage(
          {
            id: 'SignupForm.passwordTooShort',
          },
          {
            minLength: validators.PASSWORD_MIN_LENGTH,
          }
        );
        const passwordMaxLengthMessage = intl.formatMessage(
          {
            id: 'SignupForm.passwordTooLong',
          },
          {
            maxLength: validators.PASSWORD_MAX_LENGTH,
          }
        );
        const passwordMinLength = validators.minLength(
          passwordMinLengthMessage,
          validators.PASSWORD_MIN_LENGTH
        );
        const passwordMaxLength = validators.maxLength(
          passwordMaxLengthMessage,
          validators.PASSWORD_MAX_LENGTH
        );
        const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
        const passwordValidators = validators.composeValidators(
          passwordRequired,
          passwordMinLength,
          passwordMaxLength
        );

        // Custom user fields
        const userFieldProps = getPropsForCustomUserFieldInputs(userFields, intl, userType);
        const userTypeConfig = userTypes.find(config => config.userType === userType);

        const filteredPrefernce = userFields.filter(item => item.key == 'Productorservices');
        const urgencyLevel = userFields.filter(item => item.key == 'urgency_level');
        const canwehelp = userFields.filter(item => item.key == 'canwehelp');
        const serviceRegions = userFields.filter(item => item.key == 'service_regions');
        const systemExpertise = userFields.filter(item => item.key == 'system_expertise');

        const productORServices = filteredPrefernce[0]?.enumOptions;
        const urgencyLevelOption = urgencyLevel[0]?.enumOptions;
        const canwehelpOption = canwehelp[0]?.enumOptions;
        const serviceRegionsOption = serviceRegions[0]?.enumOptions;
        const systemExpertiseOption = systemExpertise[0]?.enumOptions;

        const classes = classNames(rootClassName || css.root, className);
        const submitInProgress = inProgress;
        const submitDisabled = invalid || submitInProgress;

        // Switch case function to handle tab display
        const renderTabContent = () => {
          switch (currentTab) {
            case 'initial':
              return renderInitialTab();
            case 'tab1':
              // Show tab1 data only once
              if (!tab1DataShown) {
                setTab1DataShown(true);
              }
              //   return renderTab1Content();
              // case 'roleFields':
              return renderRoleFieldsTab();
            case 'companyDetails':
              return renderCompanyDetailsTab();
            default:
              return renderInitialTab();
          }
        };

        const renderInitialTab = () => (
          <>
            <div className={css.defaultUserFields}>
              <FieldTextInput
                type="email"
                id={formId ? `${formId}.email` : 'email'}
                name="email"
                autoComplete="email"
                label={intl.formatMessage({
                  id: 'SignupForm.emailLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.emailPlaceholder',
                })}
                validate={validators.composeValidators(emailRequired, emailValid)}
              />
              <div className={css.name}>
                <FieldTextInput
                  className={css.firstNameRoot}
                  type="text"
                  id={formId ? `${formId}.fname` : 'fname'}
                  name="fname"
                  autoComplete="given-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.firstNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.firstNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.firstNameRequired',
                    })
                  )}
                />
                <FieldTextInput
                  className={css.lastNameRoot}
                  type="text"
                  id={formId ? `${formId}.lname` : 'lname'}
                  name="lname"
                  autoComplete="family-name"
                  label={intl.formatMessage({
                    id: 'SignupForm.lastNameLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.lastNamePlaceholder',
                  })}
                  validate={validators.required(
                    intl.formatMessage({
                      id: 'SignupForm.lastNameRequired',
                    })
                  )}
                />
              </div>

              <FieldTextInput
                className={css.password}
                type="password"
                id={formId ? `${formId}.password` : 'password'}
                name="password"
                autoComplete="new-password"
                label={intl.formatMessage({
                  id: 'SignupForm.passwordLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.passwordPlaceholder',
                })}
                validate={passwordValidators}
              />
            </div>
            <div className={css.userTypeContainer}>
              <FieldSelectUserType
                name="userType"
                userTypes={userTypes}
                hasExistingUserType={!!preselectedUserType}
                intl={intl}
              />

              {termsAndConditions}

              <Button
                type="button"
                className={css.nextButton}
                onClick={() => setCurrentTab('tab1')}
                disabled={!userType && !termsAndConditions}
              >
                <FormattedMessage id="SignupForm.next" />
              </Button>

            </div>
          </>
        );

        const renderRoleFieldsTab = () => (
          <div className={css.roleFieldsContainer}>


            <div className={css.tabContent}>
              {userType && (
                <div className={css.roleSpecificFields}>
                  {/* Common fields for all roles */}
                  <FieldTextInput
                    type="text"
                    id={formId ? `${formId}.companyName` : 'companyName'}
                    name="companyName"
                    label={intl.formatMessage({
                      id: 'SignupForm.companyNameLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.companyNamePlaceholder',
                    })}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'SignupForm.companyNameRequired',
                      })
                    )}
                  />

                  <FieldLocationAutocompleteInput
                    rootClassName={css.locationAddress}
                    inputClassName={css.locationAutocompleteInput}
                    iconClassName={css.locationAutocompleteInputIcon}
                    predictionsClassName={css.predictionsRoot}
                    validClassName={css.validLocation}
                    name="headquarterAddress"
                    label={intl.formatMessage({
                      id: userType === BUYER ? "SignupForm.companyAddressLabel" : 'SignupForm.headquarterAddressLabel'
                    })}
                    placeholder={intl.formatMessage({
                      id: 'EditListingLocationForm.addressPlaceholder',
                    })}
                    useDefaultPredictions={false}
                    format={identity}
                    valueFromForm={values.headquarterAddress}
                    validate={validators.composeValidators(
                      validators.autocompleteSearchRequired(addressRequiredMessage),
                      validators.autocompletePlaceSelected(addressNotRecognizedMessage)
                    )}
                  />

                  <UserFieldPhoneNumber
                    formName="SignupForm"
                    className={css.row}
                    userTypeConfig={userTypeConfig}
                    intl={intl}
                  />

                  {userType === BUYER && (
                    <div className={css.buyerFields}>
                      <FieldSelect
                        className={css.customField}
                        name="UrgencyLevel"
                        id={formId ? `${formId}.UrgencyLevel` : "UrgencyLevel"}
                        label={intl.formatMessage({
                          id: 'SignupForm.UrgencyLevelLabel',
                        })}
                      >
                        <option disabled value="">
                          {"Select urgency"}
                        </option>
                        {urgencyLevelOption?.map(optionConfig => (
                          <option key={optionConfig.key} value={optionConfig.key}>
                            {optionConfig.label}
                          </option>
                        ))}
                      </FieldSelect>

                      <FieldSelect
                        className={css.customField}
                        name="canwehelp"
                        id={formId ? `${formId}.canwehelp` : "canwehelp"}
                        label={intl.formatMessage({
                          id: 'SignupForm.canwehelpLabel',
                        })}
                      >
                        <option disabled value="">
                          {"Select help"}
                        </option>
                        {canwehelpOption?.map(optionConfig => (
                          <option key={optionConfig.key} value={optionConfig.key}>
                            {optionConfig.label}
                          </option>
                        ))}
                      </FieldSelect>
                      <div className={css.bottomWrapper}>
                        <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                          <FormattedMessage id="SignupForm.signUp" />
                        </PrimaryButton>
                      </div>
                    </div>
                  )}

                  {userType === DEALER && (
                    <div className={css.dealerFields}>
                      <FieldSelect
                        className={css.customField}
                        name="productService"
                        id={formId ? `${formId}.productService` : "productService"}
                        label={intl.formatMessage({
                          id: 'SignupForm.productsOrServicesLabel',
                        })}
                      >
                        <option disabled value="">
                          {"Select product or service"}
                        </option>
                        {productORServices?.map(optionConfig => (
                          <option key={optionConfig.key} value={optionConfig.key}>
                            {optionConfig.label}
                          </option>
                        ))}
                      </FieldSelect>

                      <FieldLocationAutocompleteInput
                        rootClassName={css.locationAddress}
                        inputClassName={css.locationAutocompleteInput}
                        iconClassName={css.locationAutocompleteInputIcon}
                        predictionsClassName={css.predictionsRoot}
                        validClassName={css.validLocation}
                        name="yardLocations"
                        label={intl.formatMessage({ id: 'SignupForm.yardAddressLabel' })}
                        placeholder={intl.formatMessage({
                          id: 'EditListingLocationForm.addressPlaceholder',
                        })}
                        useDefaultPredictions={false}
                        format={identity}
                        valueFromForm={values.yardLocations}
                        validate={validators.composeValidators(
                          validators.autocompleteSearchRequired(addressRequiredMessage),
                          validators.autocompletePlaceSelected(addressNotRecognizedMessage)
                        )}
                      />

                      <button
                        type="button"
                        className={css.nextButton}
                        onClick={() => setCurrentTab('companyDetails')}
                      >
                        <FormattedMessage id="SignupForm.next" />
                      </button>
                    </div>
                  )}

                  {userType === INSTALLER && (
                    <div className={css.installerFields}>
                      <FieldCheckboxGroup
                        className={css.customField}
                        name="serviceRegions"
                        id={formId ? `${formId}.serviceRegions` : "serviceRegions"}
                        label={intl.formatMessage({
                          id: 'SignupForm.productsOrServicesLabel',
                        })}
                        options={serviceRegionsOption?.map(optionConfig => ({
                          key: optionConfig.option,
                          label: optionConfig.label,
                        }))}
                      />
                           <button
                        type="button"
                        className={css.nextButton}
                        onClick={() => setCurrentTab('companyDetails')}
                      >
                        <FormattedMessage id="SignupForm.next" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

        const renderCompanyDetailsTab = () => (
          <div className={css.companyDetailsSection}>
            {userType === INSTALLER && (
              <div className={css.installerFields}>


                <FieldTextInput
                  type="number"
                  id={formId ? `${formId}.crewSize` : 'crewSize'}
                  name="crewSize"
                  label={intl.formatMessage({
                    id: 'SignupForm.crewSizeLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.companyNamePlaceholder',
                  })}
                />

                <FieldCheckboxGroup
                  className={css.customField}
                  name="systemExpertise"
                  id={formId ? `${formId}.systemExpertise` : "systemExpertise"}
                  label={intl.formatMessage({
                    id: 'SignupForm.productsOrServicesLabel',
                  })}
                  options={systemExpertiseOption?.map(optionConfig => ({
                    key: optionConfig.option,
                    label: optionConfig.label,
                  }))}
                />
              </div>
            )}
        {  userType === DEALER &&  <div>
              <Field
                accept={ACCEPT_IMAGES}
                id="profileImage"
                name="profileImage"
                label={intl.formatMessage({
                  id: 'SignupForm.profileImageLabel',
                })}
                type="file"
                formId={null}
                uploadImageError={uploadImageError}
                disabled={uploadInProgress}
              >
                {fieldProps => {
                  const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                  const { name, type } = input;
                  const onChange = e => {
                    const file = e.target.files[0];
                    formRenderProps.form.change(`profileImage`, file);
                    formRenderProps.form.blur(`profileImage`);
                    if (file != null) {
                      const tempId = `${file.name}_${Date.now()}`;
                      onImageUpload({ id: tempId, file });
                    }
                  };

                  const handleRemoveImage = () => {
                    onRemoveImage();
                    formRenderProps.form.change(`profileImage`, null);
                    formRenderProps.form.blur(`profileImage`);

                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                    }

                    const fileInput = document.getElementById(id);
                    if (fileInput) {
                      fileInput.value = '';
                    }
                  };

                  let error = null;

                  if (isUploadImageOverLimitError(uploadImageError)) {
                    error = (
                      <div className={css.error}>
                        <FormattedMessage id="ProfileSettingsForm.imageUploadFailedFileTooLarge" />
                      </div>
                    );
                  } else if (uploadImageError) {
                    error = (
                      <div className={css.error}>
                        <FormattedMessage id="ProfileSettingsForm.imageUploadFailed" />
                      </div>
                    );
                  }

                  return (
                    <div className={css.uploadAvatarWrapper}>
                      <label className={css.label} htmlFor={id}>
                        {label}
                      </label>

                      {!previewUrl && (
                        <input
                          accept={accept}
                          id={id}
                          name={name}
                          className={css.uploadAvatarInput}
                          disabled={disabled}
                          onChange={onChange}
                          type={type}
                        />
                      )}

                      {previewUrl && (
                        <div className={css.imagePreviewContainer}>
                          <div className={css.previewWrapper}>
                            <img
                              src={previewUrl}
                              alt="Profile preview"
                              className={css.previewImage}
                            />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className={css.removeButton}
                            >
                              <IconCollection iconName='crossIcon' />
                            </button>
                            {uploadInProgress && (
                              <div className={css.uploadSuccess}>
                                <FormattedMessage id="SignupForm.imageUploaded" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {error}
                    </div>
                  );
                }}
              </Field>

              <FieldTextInput
                type="text"
                id={formId ? `${formId}.companyWebsite` : 'companyWebsite'}
                name="companyWebsite"
                label={intl.formatMessage({
                  id: 'SignupForm.companyWebsiteLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'SignupForm.companyNamePlaceholder',
                })}
              />

              <FieldTextInput
                type="url"
                name="socialMediaUrl"
                id={formId ? `${formId}.socialMediaUrl` : 'socialMediaUrl'}
                label={intl.formatMessage({
                  id: 'SignupForm.socialMediaLabel',
                })}
                placeholder={intl.formatMessage({
                  id: 'BusinessProfileForm.instagramUrlPlaceholder',
                })}
              />
            </div>}

            <div className={css.bottomWrapper}>
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="SignupForm.signUp" />
              </PrimaryButton>
            </div>
          </div>
        );

        return (
          <Form className={classes} onSubmit={handleSubmit}>
            {renderTabContent()}
          </Form>
        );
      }}
    />
  );
};

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
