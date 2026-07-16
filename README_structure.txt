UnicAthlete prototype structure

index.html
  Platform architecture / global entry point.

signup.html
  Shared signup flow map. Shows profile-type selection, athlete guardian/age branch, and professional scout branch.

specs/
  Markdown product specifications for implementation rules behind the wireframes.
  - 03-age-based-athlete-accounts.md: guardian-managed under-14 accounts, supervised messaging, and age transitions.

recruiter/
  Recruiter-side product experience and wireframes.

athlete/
  Athlete-side product experience and wireframes.

shared/
  Shared CSS and JavaScript used across pages:
  - app-shell.css: fixed header, view switcher, role navigation overrides
  - backend-modal.css: shared backend note modal styling
  - app.js: backend note modal helpers

assets/
  Future static assets such as logos, icons, and images.

future/team-collaboration/
  Preserved reference copy of the collaboration-heavy organization workspace model.
  Use this for post-MVP planning, not for the first validation build.
