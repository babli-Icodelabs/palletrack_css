import React, { useState } from 'react';
import { bool, node, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, injectIntl, intlShape } from '../../../util/reactIntl';
import { AGENT, BUYER, propTypes, SELLER } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';
import appSettings from '../../../config/settings';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import {
  Form,
  PrimaryButton,
  FieldTextInput,
  Modal,
  FieldRadioButton,
  Button,
  FieldLocationAutocompleteInput,
  LinkTabNavHorizontal,
  FieldCheckboxGroup,
  FieldMultiSelect,
  FieldCurrencyInput,
  FieldSelect,
  CustomExtendedDataField,
  FieldPhoneNumberInput,
} from '../../../components';

import FieldSelectUserType from '../FieldSelectUserType';


import css from './SignupForm.module.css';
import { compensationPercentage } from '../../../config/configListing';
import {
  autocompleteSearchRequired,
  autocompletePlaceSelected,
  composeValidators,
} from '../../../util/validators';
import ProfileIconCard from '../../../components/SavedCardDetails/ProfileIconCard/ProfileIconCard';
import { useConfiguration } from '../../../context/configurationContext';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const identity = v => v;
const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
        onManageDisableScrolling,
        autoFocus,
        setStep,
        step,
        form,
      } = formRenderProps;

      const { userType } = values || {};
      const config = useConfiguration();
      const marketplaceCurrency = config.currency;

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

      // location
      const addressRequiredMessage = intl.formatMessage({
        id: 'EditListingLocationForm.addressRequired',
      });
      const addressNotRecognizedMessage = intl.formatMessage({
        id: 'EditListingLocationForm.addressNotRecognized',
      });

      // license Number
      const licenseNumberLabel = intl.formatMessage({
        id: 'SignupForm.licenseNumberLabel',
      });
      const licenseNumberPlaceholder = intl.formatMessage({
        id: 'SignupForm.licenseNumberPlaceholder',
      });
      const licenseNumberRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.licenseNumberRequired',
        })
      );
      // certifications
      const certificationsLabel = intl.formatMessage({
        id: 'SignupForm.certificationsLabel',
      });
      const certificationsPlaceholder = intl.formatMessage({
        id: 'SignupForm.certificationsPlaceholder',
      });
      const certificationsRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.certificationsRequired',
        })
      );
      // specialties
      const specialtiesLabel = intl.formatMessage({
        id: 'SignupForm.specialtiesLabelLabel',
      });
      const specialtiesPlaceholder = intl.formatMessage({
        id: 'SignupForm.specialtiesLabelPlaceholder',
      });
      const specialtiesRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.specialtiesRequired',
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
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;
      const submitDisabled = invalid || submitInProgress;

      const handleNext = () => {
        if (values.userType === AGENT) {
          setStep(10);
        } else if (values.userType === SELLER) {
          if (step === 8) setStep(10);
          else setStep(prev => prev + 1);
        } else if (values.userType === BUYER) {
          if (step === 5) setStep(7);
          else setStep(prev => prev + 1);
        } else {
          setStep(prev => prev + 1);
        }
      };
      const handleBack = () => {
        if (values.userType == SELLER) {
          if (step === 10) {
            setStep(8);
          } else setStep(prev => prev - 1);
        } else if (values.userType == BUYER) {
          if (step === 7) {
            setStep(5);
          } else {
            setStep(prev => prev - 1);
          }
        } else if (values.userType === AGENT) {
          setStep(1);
        } else {
          setStep(prev => prev - 1);
        }
      };
      const [phoneNumber, setPhoneNumber] = useState({
        value: '',
        countryCode: '',
        country: '',
        number: '',
      });
      const handleOnChange = (value, country) => {
        const { name = '', dialCode = '', countryCode = '', format } = country;
        form.change('phoneNumber', '+' + value);
        form.change('dialCode', dialCode);
        setPhoneNumber({
          value: value,
          countryCode: countryCode,
          countryName: name,
          dialCode: dialCode,
        });
      };
      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {(() => {
            switch (step) {
              case 1:
                return (
                  <>
                    <div className={css.joinusHeading}>
                      Let's Get <a>Started</a>
                    </div>
                    <div className={css.radioButtonWrapper}>
                      <FieldSelectUserType
                        name="userType"
                        userTypes={userTypes}
                        hasExistingUserType={!!preselectedUserType}
                        intl={intl}
                      />
                    </div>
                    <Button
                      className={css.nextButton}
                      type="button"
                      disabled={!userType}
                      onClick={handleNext}
                    >
                      <FormattedMessage id="SignupPage.nextButton" />
                    </Button>
                    <div className={css.socialButtonsOr}>
                      <span className={css.socialButtonsOrText}>
                        <FormattedMessage id="AuthenticationPage.or" />
                      </span>
                    </div>
                    <div className={css.signUpLink}>
                      Already have an account? <Link to="/login">Log in</Link>
                    </div>
                  </>
                );
              case 2:
                return (
                  <>
                    <div className={css.headingText}>
                      {values?.userType == BUYER ? (
                        <FormattedMessage id="SignupPage.locationHeadingBuyer" />
                      ) : (
                        <FormattedMessage id="SignupPage.locationHeadingSeller" />
                      )}
                    </div>
                    <div>
                      <div className={css.locationInput}>
                        <label>City</label>
                        <FieldLocationAutocompleteInput
                          rootClassName={css.locationAddressForm}
                          inputClassName={css.locationAutocompleteInput}
                          iconClassName={css.locationAutocompleteInputIcon}
                          predictionsClassName={css.predictionsRoot}
                          validClassName={css.validLocation}
                          autoFocus={autoFocus}
                          name="location"
                          placeholder={intl.formatMessage({ id: 'SignupForm.addressPlaceholder' })}
                          useDefaultPredictions={false}
                          format={identity}
                          valueFromForm={values.location}
                          validate={composeValidators(
                            autocompleteSearchRequired(addressRequiredMessage),
                            autocompletePlaceSelected(addressNotRecognizedMessage)
                          )}
                        />
                      </div>
                      <FieldTextInput
                        className={css.zipCode}
                        type="number"
                        id={formId ? `${formId}.zipCode` : 'zipCode'}
                        name="zipCode"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.zipCodeLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.zipCodePlaceholder' })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.zipCodeRequired' })
                        )}
                      />
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          disabled={!values.location?.selectedPlace || !values.zipCode}
                          onClick={handleNext}
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 3:
                return (
                  <>
                    <div className={css.headingText}>
                      {userType == SELLER ? (
                        <FormattedMessage id="SignupPage.priceRangeHeadingSeller" />
                      ) : (
                        <FormattedMessage id="SignupPage.priceRangeHeadingBuyer" />
                      )}
                    </div>
                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      {userType == BUYER && (
                        <div>
                          <FieldCurrencyInput
                            id={formId ? `${formId}.minPrice` : 'minPrice'}
                            name="minPrice"
                            className={css.input}
                            autoFocus={autoFocus}
                            label={intl.formatMessage({ id: 'SignupForm.minPriceLabel' })}
                            placeholder={intl.formatMessage({
                              id: 'SignupForm.minPriceePlaceholder',
                            })}
                            currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                          />

                          <FieldCurrencyInput
                            id={formId ? `${formId}.maxPrice` : 'maxPrice'}
                            name="maxPrice"
                            className={css.zipCode}
                            autoFocus={autoFocus}
                            label={intl.formatMessage({ id: 'SignupForm.maxPriceLabel' })}
                            placeholder={intl.formatMessage({
                              id: 'SignupForm.maxPricePlaceholder',
                            })}
                            currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                          />
                        </div>
                      )}
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (userType === BUYER && !(values?.minPrice && values?.maxPrice)) ||
                            (userType === SELLER && !values?.pub_price_range)
                          }
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 4:
                return (
                  <>
                   <div className={css.headingText}>
                      {userType == SELLER ? (
                        <FormattedMessage id="SignupPage.homeTypeSeller" />
                      ) : (
                        <FormattedMessage id="SignupPage.homeTypeBuyer" />
                      )}
                    </div>
                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (userType === 'seller' &&
                              (!values?.pub_propertyTypeSeller ||
                                values.pub_propertyTypeSeller.length === 0)) ||
                            (userType === 'buyer' &&
                              (!values?.pub_propertyTypeBuyer ||
                                values.pub_propertyTypeBuyer.length === 0))
                          }
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );

              case 5:
                return (
                  <>
                    <div className={css.headingText}>
                      {values && values.userType === BUYER ? (
                        <FormattedMessage id="SignupPage.TimelineHeadingBuyer" />
                      ) : (
                        <FormattedMessage id="SignupPage.TimelineHeadingSeller" />
                      )}
                    </div>
                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button type="button" onClick={handleNext} disabled={!values?.pub_timeline}>
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 6:
                return (
                  <>
                    <div className={css.headingText}>
                      <FormattedMessage id="SignupPage.PropertyDetails" />
                    </div>
                    <div className={css.zipInput}>
                      <FieldTextInput
                        className={css.inputRow}
                        type="text"
                        id={formId ? `${formId}.propertyAddress` : 'PropertyAddress'}
                        name="propertyAddress"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.propertyAddressLabel' })}
                        placeholder={intl.formatMessage({
                          id: 'SignupForm.propertyAddressPlaceholder',
                        })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.propertyAddressRequired' })
                        )}
                      />
                    </div>
                    <div>
                      <FieldTextInput
                        className={css.zipCode}
                        type="text"
                        id={formId ? `${formId}.squareFoot` : 'squareFoot'}
                        name="squareFoot"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.squareFootLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.squareFootPlaceholder' })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.squareFootRequired' })
                        )}
                      />
                      <FieldTextInput
                        className={css.zipCode}
                        type="text"
                        id={formId ? `${formId}.bedroom` : 'bedroom'}
                        name="bedroom"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.bedroomLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.bedroomPlaceholder' })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.bedroomRequired' })
                        )}
                      />
                      <FieldTextInput
                        className={css.zipCode}
                        type="text"
                        id={formId ? `${formId}.bathrooms` : 'bathrooms'}
                        name="bathrooms"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.bathroomsLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.bathroomsPlaceholder' })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.bathroomsRequired' })
                        )}
                      />
                      <FieldTextInput
                        className={css.zipCode}
                        type="number"
                        id={formId ? `${formId}.yearBuilt` : 'yearBuilt'}
                        name="yearBuilt"
                        autoComplete="given-name"
                        label={intl.formatMessage({ id: 'SignupForm.yearBuiltLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.yearBuiltPlaceholder' })}
                        validate={validators.required(
                          intl.formatMessage({ id: 'SignupForm.yearBuiltRequired' })
                        )}
                      />
                    </div>
                    <div className={css.actionButtons}>
                      <Button type="button" onClick={handleBack}>
                        <FormattedMessage id="SignupPage.backButton" />
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          !(
                            values?.propertyAddress &&
                            values?.yearBuilt &&
                            values?.bathrooms &&
                            values?.bedroom &&
                            values?.squareFoot
                          )
                        }
                      >
                        <FormattedMessage id="SignupPage.nextButton" />
                      </Button>
                    </div>
                  </>
                );
              case 7:
                return (
                  <>
                    <div className={css.headingText}>
                      <FormattedMessage id="SignupPage.CompensationpriceHeading" />
                    </div>
                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      {values && values.pub_compensationOffer == 'percentage' && (
                        <FieldSelect
                          id={formId ? `${formId}.compPercentage` : 'compPercentage'}
                          name="compPercentage"
                          className={css.inputBox}
                          label={intl.formatMessage({ id: 'SignupForm.compPercentageLabel' })}
                        >
                          <option disabled value="">
                            {intl.formatMessage({
                              id: 'SignupForm.compPercentagePlaceholder',
                            })}
                          </option>
                          {compensationPercentage.map(st => {
                            return (
                              <option key={st.option} value={st.option}>
                                {st.label}
                              </option>
                            );
                          })}
                        </FieldSelect>
                      )}
                      {values && values.pub_compensationOffer == 'fixed-amount' && (
                        <FieldCurrencyInput
                          id={formId ? `${formId}.compPrice` : 'compPrice'}
                          name="compPrice"
                          className={css.zipCode}
                          autoFocus={autoFocus}
                          label={intl.formatMessage({ id: 'SignupForm.compPriceLabel' })}
                          placeholder={intl.formatMessage({
                            id: 'SignupForm.compPricePlaceholder',
                          })}
                          currencyConfig={appSettings.getCurrencyFormatting(marketplaceCurrency)}
                        />
                      )}
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={!(values.compPercentage || values.compPrice)}
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 8:
                return (
                  <>
                    <div className={css.headingText}>
                      {values && values.userType == SELLER ? (
                        <FormattedMessage id="SignupPage.motivationToSellHeading" />
                      ) : (
                        <FormattedMessage id="SignupPage.motivationToBuyHeading" />
                      )}
                    </div>

                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}

                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={
                            (userType === BUYER && !values?.pub_motivationToBuy) ||
                            (userType === SELLER && !values?.pub_motivationToSell)
                          }
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 9:
                return (
                  <>
                    <div className={css.headingText}>
                      <FormattedMessage id="SignupPage.prequalifedBankHeading" />
                    </div>
                    <div>
                      {showCustomUserFields ? (
                        <div className={css.customFields}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <Button
                          type="button"
                          onClick={handleNext}
                          disabled={!values?.pub_prequalifiedBank}
                        >
                          <FormattedMessage id="SignupPage.nextButton" />
                        </Button>
                      </div>
                    </div>
                  </>
                );
              case 10:
                return (
                  <>
                    <div className={css.inputSectionWrapper}>
                      <div className={css.name}>
                        <FieldTextInput
                          className={css.firstNameRoot}
                          type="text"
                          id={formId ? `${formId}.fname` : 'fname'}
                          name="fname"
                          autoComplete="given-name"
                          label={intl.formatMessage({ id: 'SignupForm.firstNameLabel' })}
                          placeholder={intl.formatMessage({
                            id: 'SignupForm.firstNamePlaceholder',
                          })}
                          validate={validators.required(
                            intl.formatMessage({ id: 'SignupForm.firstNameRequired' })
                          )}
                        />
                        <FieldTextInput
                          className={css.lastNameRoot}
                          type="text"
                          id={formId ? `${formId}.lname` : 'lname'}
                          name="lname"
                          autoComplete="family-name"
                          label={intl.formatMessage({ id: 'SignupForm.lastNameLabel' })}
                          placeholder={intl.formatMessage({ id: 'SignupForm.lastNamePlaceholder' })}
                          validate={validators.required(
                            intl.formatMessage({ id: 'SignupForm.lastNameRequired' })
                          )}
                        />
                      </div>
                      <div className={css.phoneInput}>
                        <label>Phone No.</label>
                        <PhoneInput
                          name="phoneNumber"
                          id={formId ? `${formId}.phoneNumber` : 'phoneNumber'}
                          country={'us'}
                          value={phoneNumber.value}
                          onChange={handleOnChange}
                        />
                      </div>
                      <FieldTextInput
                        className={css.inputBox}
                        type="email"
                        id={formId ? `${formId}.email` : 'email'}
                        name="email"
                        autoComplete="email"
                        label={intl.formatMessage({ id: 'SignupForm.emailLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.emailPlaceholder' })}
                        validate={validators.composeValidators(emailRequired, emailValid)}
                      />
                      {showCustomUserFields ? (
                        <div className={css.customFieldsLanguage}>
                          {userFieldProps.map(fieldProps => (
                            <CustomExtendedDataField
                              {...fieldProps}
                              formId={formId}
                              step={step}
                              userType={values?.userType}
                            />
                          ))}
                        </div>
                      ) : null}
                      <FieldTextInput
                        className={css.inputBox}
                        type="password"
                        id={formId ? `${formId}.password` : 'password'}
                        name="password"
                        autoComplete="new-password"
                        label={intl.formatMessage({ id: 'SignupForm.passwordLabel' })}
                        placeholder={intl.formatMessage({ id: 'SignupForm.passwordPlaceholder' })}
                        validate={passwordValidators}
                      />
                      {values.userType === AGENT ? <div>
                        <FieldTextInput
                          className={css.inputBox}
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          label={licenseNumberLabel}
                          placeholder={licenseNumberPlaceholder}
                          validate={validators.composeValidators(licenseNumberRequired)}
                        />
                        <FieldTextInput
                          className={css.inputBox}
                          type="text"
                          id="certifications"
                          name="certifications"
                          label={certificationsLabel}
                          placeholder={certificationsPlaceholder}
                          validate={validators.composeValidators(certificationsRequired)}
                        />
                        <FieldTextInput
                          className={css.inputBox}
                          type="text"
                          id="specialties"
                          name="specialties"
                          label={specialtiesLabel}
                          placeholder={specialtiesPlaceholder}
                          validate={validators.composeValidators(specialtiesRequired)}
                        />
                      </div> : null}
                      <div className={css.termsText}>{termsAndConditions}</div>
                      <div className={css.actionButtons}>
                        <Button type="button" onClick={handleBack}>
                          <FormattedMessage id="SignupPage.backButton" />
                        </Button>
                        <PrimaryButton
                          type="submit"
                          inProgress={submitInProgress}
                          disabled={submitDisabled}
                        >
                          <FormattedMessage id="SignupForm.signUp" />
                        </PrimaryButton>
                      </div>
                    </div>

                    <div className={css.socialButtonsOr}>
                      <span className={css.socialButtonsOrText}>
                        <FormattedMessage id="AuthenticationPage.or" />
                      </span>
                    </div>
                    <div className={css.socialMediaSection}>
                      <ProfileIconCard type="facebook" />
                      <ProfileIconCard type="google" />
                    </div>
                    <div className={css.signUpLink}>
                      Already have an account? <a href="/login">Log in</a>
                    </div>
                  </>
                );
              default:
                return null;
            }
          })()}
        </Form>
      );
    }}
  />
);

SignupFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  formId: null,
  inProgress: false,
  preselectedUserType: null,
};

SignupFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  formId: string,
  inProgress: bool,
  termsAndConditions: node.isRequired,
  preselectedUserType: string,
  userTypes: propTypes.userTypes.isRequired,
  userFields: propTypes.listingFields.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const SignupForm = compose(injectIntl)(SignupFormComponent);
SignupForm.displayName = 'SignupForm';

export default SignupForm;
