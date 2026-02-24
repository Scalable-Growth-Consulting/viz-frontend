# Auth Page Change Log

## 1. Added Confirm Password Functionality
- Introduced a new state variable `confirmPassword` to store the confirm password value.
- Added a confirm password input field that appears only during signup (when `isLogin` is false).
- Added validation to ensure that the password and confirm password fields match during signup.
- Displays an error message if the passwords do not match.

## 2. Advanced Password Validation
- Password must be at least 6 characters long and include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Displays an error message if the password does not meet these requirements.

## 3. Name Validation
- Full name is required during signup.
- Name must only contain letters and spaces (no numbers or special characters).
- Displays an error message if the name is invalid.

## 4. Error Display
- All validation errors are shown below the relevant input fields in red text.

## 5. General Improvements
- Validation is performed before attempting to sign up.
- If validation fails, the form is not submitted and errors are shown immediately.

## 6. Added "Forgot Password?" Button
- Added a "Forgot Password?" button below the password field on the sign-in page (when `isLogin` is true).
- This button is ready to be connected to a password reset flow or page.

## 7. Implemented "Forgot Password?" Functionality
- Added a `resetPassword` function to the AuthContext using Supabase's `resetPasswordForEmail`.
- Exposed `resetPassword` via the AuthContext and used it in the Auth page.
- The "Forgot Password?" button now sends a password reset email to the entered address and shows a toast notification for success or error.
- If no email is entered, the user is prompted to enter their email before requesting a reset.

---

**Note:**
- These changes improve the security and user experience of the signup and login process.
- This changelog will be updated with all future changes to authentication-related code.
