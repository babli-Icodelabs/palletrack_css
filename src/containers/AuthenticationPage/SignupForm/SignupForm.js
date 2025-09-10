import React, { useState, useEffect, useCallback } from 'react';
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
import { checkUserAlreadyExist } from '../../../util/api';

const ACCEPT_IMAGES = 'image/*';
const UPLOAD_CHANGE_DELAY = 2000; // S
const SIGNUP_FORM_STORAGE_KEY = 'signupFormData';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;
const identity = v => v;
const SignupFormComponent = props => {
  const [showRoleFields, setShowRoleFields] = useState(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [currentTab, setCurrentTab] = useState('initial');
  const [tab1DataShown, setTab1DataShown] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedFormData, setSavedFormData] = useState({});
  const [signupError, setSignupError] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const onProgressChange = props.onProgressChange;

  // Local storage utility functions
  const saveFormDataToStorage = useCallback((formData) => {
    try {
      const dataToSave = {
        ...formData,
        currentTab,
        timestamp: Date.now()
      };
      localStorage.setItem(SIGNUP_FORM_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [currentTab]);

  const loadFormDataFromStorage = useCallback(() => {
    try {
      const savedData = localStorage.getItem(SIGNUP_FORM_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Check if data is not older than 24 hours
        const isDataFresh = parsedData.timestamp && (Date.now() - parsedData.timestamp) < 24 * 60 * 60 * 1000;
        if (isDataFresh) {
          const { timestamp, currentTab: savedTab, ...formData } = parsedData;
          setCurrentTab(savedTab || 'initial');
          return formData;
        } else {
          // Remove expired data
          localStorage.removeItem(SIGNUP_FORM_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
      localStorage.removeItem(SIGNUP_FORM_STORAGE_KEY);
    }
    return {};
  }, []);

  const clearFormDataFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(SIGNUP_FORM_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  }, []);

  // Load saved form data on component mount
  useEffect(() => {
    const loadedData = loadFormDataFromStorage();
    setSavedFormData(loadedData);
    setIsLoaded(true);
  }, [loadFormDataFromStorage]);

  useEffect(() => {
    if (typeof onProgressChange === 'function') {
      let percent = 30;
      if (currentTab === 'tab1') {
        percent = 60;
        // Buyers finish at this step
        // eslint-disable-next-line no-undef
      } else if (currentTab === 'companyDetails') {
        percent = 90;
      }
      onProgressChange(percent);
    }
  }, [currentTab, onProgressChange]);

  // Don't render the form until we've loaded the saved data
  if (!isLoaded) {
    return <div>Loading...</div>;
  }



  return (
    <FinalForm
      {...props}
      mutators={{ ...arrayMutators }}
      initialValues={{
        userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes),
        ...savedFormData
      }}
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
          previewUrl,
        } = formRenderProps;

        // Save form data to localStorage whenever values change
        useEffect(() => {
          if (values && Object.keys(values).length > 0) {
            // Only save if form has been interacted with (not just initial load)
            const hasUserInput = Object.keys(values).some(key => {
              const initialValue = savedFormData[key] || (key === 'userType' ? props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) : undefined);
              return values[key] !== initialValue;
            });

            if (hasUserInput || Object.keys(savedFormData).length === 0) {
              // Save all form data including password and profileImage
              saveFormDataToStorage(values);
            }
          }
        }, [values, saveFormDataToStorage, savedFormData, props.preselectedUserType, props.userTypes]);

        // Enhanced handleSubmit to clear localStorage on successful signup
        const enhancedHandleSubmit = async (formData) => {
          try {
            const result = await handleSubmit(formData);
            // Clear localStorage on successful signup
            clearFormDataFromStorage();
            return result;
          } catch (error) {
            // Don't clear localStorage if signup fails
            throw error;
          }
        };
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
        // Function to handle going back to previous tab
        const handleGoBack = () => {
          switch (currentTab) {
            case 'tab1':
              setCurrentTab('initial');
              break;
            case 'companyDetails':
              setCurrentTab('tab1');
              break;
            default:
              setCurrentTab('initial');
          }
        };
        const checkUser = async () => {
          setCheckingUser(true);
          try {
            const email = values.email;
            const response = await checkUserAlreadyExist({ email });
            // Check the response structure
            if (response && response.exists) {
              setSignupError('User with this email already exists');
            } else {
              setCurrentTab('tab1');
            }
          } catch (error) {
            console.error('Error checking user:', error);
            setSignupError('Failed to verify email. Please try again.');
          } finally {
            setCheckingUser(false);
          }
        };
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

              {signupError && (
                <div className={css.error}>
                  {signupError}
                </div>
              )}

              <Button
                type="button"
                className={css.nextButton}
                onClick={checkUser}
                disabled={invalid || !userType || checkingUser}
              >
                {checkingUser ? (
                  <FormattedMessage id="SignupForm.checking" defaultMessage="Checking..." />
                ) : (
                  <FormattedMessage id="SignupForm.next" />
                )}
              </Button>

            </div>
          </>
        );

        const renderRoleFieldsTab = () => (
          <div className={css.roleFieldsContainer}>
            <Button
              type="button"
              className={css.backButton}
              onClick={handleGoBack}
            >
              <FormattedMessage id="SignupForm.back" />
            </Button>

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
                      <div />
                      <Button
                        type="button"
                        className={css.nextButton}
                        onClick={() => setCurrentTab('companyDetails')}
                      // disabled={invalid || submitInProgress}
                      >
                        <FormattedMessage id="SignupForm.next" />
                      </Button>
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
                      <Button
                        type="button"
                        className={css.nextButton}
                        onClick={() => setCurrentTab('companyDetails')}
                        disabled={invalid || submitInProgress}
                      >
                        <FormattedMessage id="SignupForm.next" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

        const renderCompanyDetailsTab = () => (
          <div className={css.roleSpecificFields}>
            <Button
              type="button"
              className={css.backButton}
              onClick={handleGoBack}
            >
              <FormattedMessage id="SignupForm.back" />
            </Button>
            {userType === INSTALLER && (
              <div className={css.roleSpecificFields}>


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
            {userType === DEALER && <div className={css.roleSpecificFields}>
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
                        <div>
                          <input
                            accept={accept}
                            id={id}
                            name={name}
                            className={css.uploadAvatarInput}
                            disabled={disabled}
                            onChange={onChange}
                            type={type}
                          />
                          <label className={css.uploadButton} htmlFor={id}>
                            <span className={css.uploadIcon} aria-hidden="true">
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.2199 20.8126H5.77994C5.43316 20.7984 5.09256 20.716 4.77765 20.5701C4.46274 20.4242 4.17969 20.2176 3.9447 19.9622C3.70971 19.7068 3.52739 19.4075 3.40818 19.0816C3.28896 18.7556 3.23519 18.4093 3.24994 18.0626V15.0626C3.24994 14.8637 3.32896 14.6729 3.46961 14.5322C3.61027 14.3916 3.80103 14.3126 3.99994 14.3126C4.19886 14.3126 4.38962 14.3916 4.53027 14.5322C4.67093 14.6729 4.74994 14.8637 4.74994 15.0626V18.0626C4.72412 18.3595 4.81359 18.655 4.99977 18.8877C5.18596 19.1204 5.45459 19.2726 5.74994 19.3126H18.2199C18.5153 19.2726 18.7839 19.1204 18.9701 18.8877C19.1563 18.655 19.2458 18.3595 19.2199 18.0626V15.0626C19.2199 14.8637 19.299 14.6729 19.4396 14.5322C19.5803 14.3916 19.771 14.3126 19.9699 14.3126C20.1689 14.3126 20.3596 14.3916 20.5003 14.5322C20.6409 14.6729 20.7199 14.8637 20.7199 15.0626V18.0626C20.7499 18.7579 20.504 19.437 20.0358 19.952C19.5676 20.467 18.915 20.7763 18.2199 20.8126ZM15.9999 8.81257C15.9014 8.81304 15.8038 8.79382 15.7128 8.75604C15.6217 8.71826 15.5392 8.66268 15.4699 8.59257L11.9999 5.12257L8.52994 8.59257C8.38777 8.72505 8.19972 8.79718 8.00542 8.79375C7.81112 8.79032 7.62573 8.71161 7.48832 8.57419C7.35091 8.43678 7.2722 8.2514 7.26877 8.0571C7.26534 7.86279 7.33746 7.67475 7.46994 7.53257L11.4699 3.53257C11.6106 3.39212 11.8012 3.31323 11.9999 3.31323C12.1987 3.31323 12.3893 3.39212 12.5299 3.53257L16.5299 7.53257C16.6704 7.6732 16.7493 7.86382 16.7493 8.06257C16.7493 8.26132 16.6704 8.45195 16.5299 8.59257C16.4607 8.66268 16.3781 8.71826 16.2871 8.75604C16.1961 8.79382 16.0985 8.81304 15.9999 8.81257Z" fill="#4A4A4A" />
                                <path d="M12 15.8125C11.8019 15.8099 11.6126 15.7301 11.4725 15.59C11.3324 15.4499 11.2526 15.2606 11.25 15.0625V4.0625C11.25 3.86359 11.329 3.67282 11.4697 3.53217C11.6103 3.39152 11.8011 3.3125 12 3.3125C12.1989 3.3125 12.3897 3.39152 12.5303 3.53217C12.671 3.67282 12.75 3.86359 12.75 4.0625V15.0625C12.7474 15.2606 12.6676 15.4499 12.5275 15.59C12.3874 15.7301 12.1981 15.8099 12 15.8125Z" fill="#4A4A4A" />
                              </svg>

                            </span>
                            Upload logo
                          </label>
                        </div>
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
          <Form className={classes} onSubmit={enhancedHandleSubmit}>
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
