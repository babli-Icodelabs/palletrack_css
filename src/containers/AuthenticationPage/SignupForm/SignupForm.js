import React from 'react';
import { Field, Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { BUYER, DEALER, INSTALLER, propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput, CustomExtendedDataField, FieldLocationAutocompleteInput, FieldSelect, ImageFromFile, FieldCheckboxGroup } from '../../../components';

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
const SignupFormComponent = props => (
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
      console.log('userType :>> ', userType);
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

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.
      const userFieldProps = getPropsForCustomUserFieldInputs(userFields, intl, userType);

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const filteredPrefernce = userFields.filter(
        item => item.key == 'Productorservices'
      );
      const urgencyLevel = userFields.filter(
        item => item.key == 'urgency_level'
      );
      const canwehelp = userFields.filter(
        item => item.key == 'canwehelp'
      );
      const serviceRegions = userFields.filter(
        item => item.key == 'service_regions'
      );
      const systemExpertise = userFields.filter(
        item => item.key == 'system_expertise'
      );
      const productORServices = filteredPrefernce[0]?.enumOptions;
      const urgencyLevelOption = urgencyLevel[0]?.enumOptions;
      const canwehelpOption = canwehelp[0]?.enumOptions;
      const serviceRegionsOption = serviceRegions[0]?.enumOptions;
      const systemExpertiseOption = systemExpertise[0]?.enumOptions;
      
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;
      const fileExists = !!profileImage?.file;
      const fileUploadInProgress = uploadInProgress && fileExists;
      const delayAfterUpload = profileImage?.imageId && this.state.uploadDelay;
      const imageFromFile =
        fileExists && (fileUploadInProgress || delayAfterUpload) ? (
          <ImageFromFile
            id={profileImage.id}
            className={errorClasses}
            rootClassName={css.uploadingImage}
            aspectWidth={1}
            aspectHeight={1}
            file={profileImage.file}
          >
            {uploadingOverlay}
          </ImageFromFile>
        ) : null;

      // Avatar is rendered in hidden during the upload delay
      // Upload delay smoothes image change process:
      // responsive img has time to load srcset stuff before it is shown to user.
      const hasUploadError = !!uploadImageError && !uploadInProgress;
      const errorClasses = classNames({ [css.avatarUploadError]: hasUploadError });
      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>


          {/* {showDefaultUserFields ? (
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

              <UserFieldDisplayName
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

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

              <UserFieldPhoneNumber
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

              <div className={css.profileImage}>
                <Field
                  accept={ACCEPT_IMAGES}
                  id="profileImage"
                  name="profileImage"
                  label={intl.formatMessage({
                    id: 'SignupForm.profileImageLabel',
                  })}
                  type="file"
                  form={null}
                  uploadImageError={uploadImageError}
                  disabled={uploadInProgress}
                >
                  {fieldProps => {
                    const { accept, id, input, label, disabled, uploadImageError } = fieldProps;
                    const { name, type } = input;
                    const onChange = e => {
                      const file = e.target.files[0];
                      form.change(`profileImage`, file);
                      form.blur(`profileImage`);
                      if (file != null) {
                        const tempId = `${file.name}_${Date.now()}`;
                        onImageUpload({ id: tempId, file });
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
                        <input
                          accept={accept}
                          id={id}
                          name={name}
                          className={css.uploadAvatarInput}
                          disabled={disabled}
                          onChange={onChange}
                          type={type}
                        />
                        {error}
                      </div>
                    );
                  }}
                </Field>
              </div>
            </div>
          ) : null} */}
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
            {/* 
            <UserFieldDisplayName
              formName="SignupForm"
              className={css.row}
              userTypeConfig={userTypeConfig}
              intl={intl}
            /> */}

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

          <FieldSelectUserType
            name="userType"
            userTypes={userTypes}
            hasExistingUserType={!!preselectedUserType}
            intl={intl}
          />
          {showCustomUserFields ?
            <div>

              <FieldTextInput
                // className={css.lastNameRoot}
                type="text"
                id={formId ? `${formId}.companyName` : 'companyName'}
                name="companyName"
                autoComplete="family-name"
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
                // autoFocus={autoFocus}
                name="headquarterAddress"
                label={intl.formatMessage({ id: userType == BUYER ? "SignupForm.companyAddressLabel" : 'SignupForm.headquarterAddressLabel' })}
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

              {userType == INSTALLER &&
                <div>
                  <FieldCheckboxGroup
                    className={css.customField}
                    name="serviceRegions"
                    id={formId ? `${formId}.serviceRegions` : "serviceRegions"}
                    label={intl.formatMessage({
                      id: 'SignupForm.productsOrServicesLabel',
                    })}
                    options={serviceRegionsOption.map(optionConfig => ({
                      key: optionConfig.option,
                      label: optionConfig.label,
                    }))}
                  />

                  <FieldTextInput
                    // className={css.lastNameRoot}
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
                </div>
              }
              <UserFieldPhoneNumber
                formName="SignupForm"
                className={css.row}
                userTypeConfig={userTypeConfig}
                intl={intl}
              />

              {userType == INSTALLER &&
                <div>

                  <FieldTextInput
                    // className={css.lastNameRoot}
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
                    options={systemExpertiseOption.map(optionConfig => ({
                      key: optionConfig.option,
                      label: optionConfig.label,
                    }))}
                  />

                </div>

              }
              {userType == INSTALLER ? null : <FieldLocationAutocompleteInput
                rootClassName={css.locationAddress}
                inputClassName={css.locationAutocompleteInput}
                iconClassName={css.locationAutocompleteInputIcon}
                predictionsClassName={css.predictionsRoot}
                validClassName={css.validLocation}
                // autoFocus={autoFocus}
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
              />}

              {userType === BUYER && <div>
                <FieldSelect
                  className={css.customField}
                  name="UrgencyLevel"
                  id={formId ? `${formId}.${"UrgencyLevel"}` : "UrgencyLevel"}
                  label={intl.formatMessage({
                    id: 'SignupForm.UrgencyLevelLabel',
                  })}
                // placeholder={intl.formatMessage({
                //   id: 'SignupForm.companyNamePlaceholder',
                // })}
                // {...validateMaybe}
                >
                  <option disabled value="">
                    {"Select urgency"}
                  </option>
                  {urgencyLevelOption.map(optionConfig => {
                    const key = optionConfig.key;
                    return (
                      <option key={key} value={key}>
                        {optionConfig.label}
                      </option>
                    );
                  })}
                </FieldSelect>


                <FieldSelect
                  className={css.customField}
                  name="canwehelp"
                  id={formId ? `${formId}.${"canwehelp"}` : "canwehelp"}
                  label={intl.formatMessage({
                    id: 'SignupForm.canwehelpLabel',
                  })}
                // placeholder={intl.formatMessage({
                //   id: 'SignupForm.companyNamePlaceholder',
                // })}
                // {...validateMaybe}
                >
                  <option disabled value="">
                    {"Select help"}
                  </option>
                  {canwehelpOption.map(optionConfig => {
                    const key = optionConfig.key;
                    return (
                      <option key={key} value={key}>
                        {optionConfig.label}
                      </option>
                    );
                  })}
                </FieldSelect>
              </div>
              }

              {userType == DEALER &&
                <FieldSelect
                  className={css.customField}
                  name="productService"
                  id={formId ? `${formId}.${"productService"}` : "productService"}
                  label={intl.formatMessage({
                    id: 'SignupForm.productsOrServicesLabel',
                  })}
                // placeholder={intl.formatMessage({
                //   id: 'SignupForm.companyNamePlaceholder',
                // })}
                // {...validateMaybe}
                >
                  <option disabled value="">
                    {"Select product or service"}
                  </option>
                  {productORServices.map(optionConfig => {
                    const key = optionConfig.key;
                    return (
                      <option key={key} value={key}>
                        {optionConfig.label}
                      </option>
                    );
                  })}
                </FieldSelect>}

              {userType == DEALER &&

                <div>
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
                        formId.change(`profileImage`, file);
                        formId.blur(`profileImage`);
                        if (file != null) {
                          const tempId = `${file.name}_${Date.now()}`;
                          onImageUpload({ id: tempId, file });
                        }
                      };

                      const handleRemoveImage = () => {
                        onRemoveImage();
                        formId.change(`profileImage`, null);
                        formId.blur(`profileImage`);

                        if (previewUrl) {
                          URL.revokeObjectURL(previewUrl);
                        }

                        // Reset file input
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

                          {/* File input */}
                          {!previewUrl && <input
                            accept={accept}
                            id={id}
                            name={name}
                            className={css.uploadAvatarInput}
                            disabled={disabled}
                            onChange={onChange}
                            type={type}
                          />}

                          {/* Image Preview */}
                          {previewUrl && (
                            <div className={css.imagePreviewContainer}>
                              <div className={css.previewWrapper}>
                                <img
                                  src={previewUrl}
                                  alt="Profile preview"
                                  className={css.previewImage}
                                  onLoad={() => {
                                    if (!uploadInProgress) {
                                      URL.revokeObjectURL(previewUrl);
                                    }
                                  }}
                                />

                                {/* Remove Image button */}
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
                    // className={css.lastNameRoot}
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

                </div>
              }


            </div> : null}

          {/* {showCustomUserFields ? (
            <div className={css.customFields}>
              {userFieldProps.map(({ key, ...fieldProps }) => (
                <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
              ))}
            </div>
          ) : null} */}

          <div className={css.bottomWrapper}>
            {termsAndConditions}
            <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
              <FormattedMessage id="SignupForm.signUp" />
            </PrimaryButton>
          </div>
        </Form>
      );
    }}
  />
);

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
