# Age-Based Athlete Account Rules

## Purpose

UnicAthlete allows athlete profiles without a minimum age restriction, but account control and communication permissions depend on the athlete's age and guardian relationship.

This specification defines the MVP rules for under-18 athlete accounts, with special focus on athletes under 14.

## Core Account Model

- `User` is the account/auth identity.
- `Profile` is the product identity attached to a user.
- MVP profile types are `AthleteProfile` and `ProfessionalProfile`.
- `AthleteProfile` can have one or more associated `User` accounts through a profile-user relationship layer.
- This relationship layer stores each user's role, permissions, consent state, and age-based access mode for that athlete profile.
- An athlete profile may be self-managed, guardian-managed, or supervised depending on age and consent state.
- Guardian logic belongs to the athlete profile relationship, not to a separate athlete profile type.
- For ages 14-17, the athlete and guardian are two separate `User` accounts linked to the same `AthleteProfile`.
- The athlete and guardian must never share one email/password login.

```text
AthleteProfile
└── ProfileUsers[]
    ├── athlete user
    │   ├── relationship: athlete
    │   └── permissions: profile access, allowed edits, supervised actions
    ├── guardian user
    │   ├── relationship: parent / legal guardian
    │   └── permissions: consent, approvals, visibility, sensitive sharing
    └── future additional guardian / manager
```

## Signup Decision Flow

```text
Start signup
-> Choose profile type
   -> Athlete Profile
      -> Enter athlete date of birth
      -> System determines age band
      -> Show only the management options allowed for that age band
      -> Apply account and communication rules
   -> Professional / Scout Profile
      -> Continue professional onboarding
```

## Age Band Rules

| Athlete age | Account owner | Athlete login | Profile management | Messaging | Guardian role |
| --- | --- | --- | --- | --- | --- |
| Under 14 | Guardian | Not enabled in MVP | Guardian manages | Guardian replies on behalf of athlete | Required |
| 14-15 | Athlete + guardian | Can be invited | Supervised/shared | Athlete drafts; guardian approves before send | Required |
| 16-17 | Athlete + guardian | Enabled | Supervised/shared | Independent only after athlete + guardian consent | Required |
| 18+ | Athlete | Enabled | Athlete manages | Independent | Removed or converted through transfer flow |

## Under-14 MVP Rules

For athletes under 14:

- The athlete profile can exist on the platform.
- The account is created and owned by a verified parent or guardian.
- The guardian enters their own name, email, and relationship to the athlete.
- The guardian verifies their email before the athlete profile becomes active.
- Guardian identity verification is required before the athlete profile can become scout-visible.
- Guardian identity verification may be completed during signup or later from account settings.
- The guardian creates and manages the athlete profile.
- The athlete does not have an independent login in MVP.
- The athlete does not send messages independently.
- Scout messages and information requests are delivered to the guardian-managed account.
- The guardian replies and responds to requests on behalf of the athlete.
- The scout side should show that the profile is guardian-managed.

## Under-14 Signup Flow

```text
Create account
-> Choose Athlete Profile
-> Enter athlete date of birth (wireframe uses direct age-band buttons for review convenience)
-> System detects athlete is under 14
-> Show parent / guardian requirement on the guardian details step
-> Enter guardian details
-> Capture parent / guardian consent
-> Verify guardian identity now, or continue and verify later
-> Apply guardian-managed mode
-> Complete athlete profile setup
```

If the athlete date of birth shows the athlete is under 14:

```text
On the guardian details step, show requirement message:
"Athletes under 14 need a parent or guardian to create and manage their profile."
-> Continue with guardian-managed account creation
```

Under-14 athletes should not be shown "I am the athlete" as an available management option, and they do not need a separate choice screen because there is only one allowed path.

## Under-14 Guardian Consent

The under-14 flow must capture explicit guardian consent before the athlete profile becomes active.

Consent should be split into separate confirmations rather than one broad checkbox:

- Guardian authority: guardian confirms they are the parent or legal guardian of the athlete.
- Profile creation and management: guardian consents to creating and managing the athlete profile.
- Data processing: guardian consents to UnicAthlete processing athlete profile information for athlete discovery and recruiting review.
- Scout visibility: guardian understands that verified scouts may view the athlete profile according to chosen visibility settings.
- International scout access: guardian understands that verified scouts may be located in Canada, the United States, or other countries.
- Messages and requests: guardian understands scout messages and information requests are handled through the guardian account.
- Rights and withdrawal: guardian understands they can request access, correction, deletion, or withdraw consent, subject to platform and legal requirements.
- Terms and privacy: guardian agrees to the current Privacy Policy and Terms.

All required consent items must be checked before the account/profile can activate.

MVP verification foundation:

- Guardian email verification is required.
- Guardian identity verification is required before scout visibility, messaging, or sensitive sharing can activate.
- Guardian identity verification should use a secure third-party hosted flow.
- If the guardian chooses Verify later, the athlete profile can remain draft/limited while setup continues.
- The platform should store verification status, provider reference, verified age/adult status if returned, and timestamp.
- The platform should not store ID document images unless legal review requires it.
- The consent screen should reference current Privacy Policy and Terms links before launch.

Consent record should store:

```text
guardian_user_id
guardian_email
athlete_profile_id
athlete_age_band = under_14
consent_items[]
consent_version
privacy_policy_version
terms_version
timestamp
ip/device metadata if appropriate
```

## Communication Rules

### Under 14

- Guardian receives scout messages and information requests.
- Guardian can reply to scout messages.
- Guardian can approve or provide requested information.
- Athlete messaging composer is not available.

### 14-15

- Athlete login can be created only through guardian invitation.
- Athlete can draft messages.
- Drafted messages are held for guardian approval.
- Message is sent only after guardian approval.

## Age 14-15 Supervised Signup Flow

For athletes aged 14-15, two signup paths are allowed because both are realistic:

1. Athlete starts signup and guardian approves by email.
2. Guardian starts signup and can invite the athlete now or later.

Both paths link to the same athlete profile. If the athlete starts, both user accounts are created during signup/approval. If the guardian starts, the guardian account can be active first and the athlete login can remain pending until the athlete has an email and accepts an invitation.

```text
AthleteProfile
├── Athlete User Account
│   ├── status: active if athlete starts / pending if guardian starts first
│   ├── athlete email
│   ├── athlete password
│   └── supervised athlete access after activation
└── Guardian User Account
    ├── guardian email
    ├── guardian password
    └── consent, approvals, and safety controls
```

When the athlete user is active, the athlete can access the profile and draft messages. The guardian user approves outgoing messages, manages consent, and controls safety/visibility settings.

### Athlete Starts

```text
Create account
-> Choose Athlete Profile
-> Enter athlete date of birth (wireframe uses direct age-band buttons for review convenience)
-> System detects athlete is 14-15
-> Athlete chooses "I am the athlete"
-> Athlete enters athlete email and creates athlete password
-> Athlete enters guardian name, guardian email, and relationship
-> Guardian receives secure consent/approval email
-> Guardian opens secure link
-> Guardian confirms authority and supervised-access consent
-> Guardian can verify identity from the same email flow or choose Verify later
-> Profile becomes supervised after guardian approval
```

In the athlete-start path, do not ask for guardian password. The guardian is not creating a login on the athlete account-details screen; the athlete provides guardian name, email, and relationship only so the system can send a secure consent link. The consent page should be treated as an email-link view opened by the guardian.

Until guardian approval is completed:

- Athlete account may exist in limited mode.
- Profile remains draft/not visible to scouts.
- Messaging is disabled.
- Athlete sees status: `Waiting for guardian approval`.
- If guardian identity verification is still pending, scout visibility and messaging remain locked even after consent.

### Guardian Starts

```text
Create account
-> Choose Athlete Profile
-> Enter athlete date of birth
-> System detects athlete is 14-15
-> Guardian chooses "I am a parent / guardian"
-> Guardian enters guardian email and creates guardian password
-> Guardian consents inside the platform
-> Guardian verifies identity now, or chooses Verify later
-> Guardian may enter athlete email for login invitation, or skip it if the athlete does not have email yet
-> Profile becomes supervised after guardian consent
-> Athlete login remains pending until invitation is sent and accepted
```

Build priority:

- Athlete-starts flow is the simpler first MVP path.
- Guardian-starts flow is useful because under-14 guardian-managed accounts already exist, but it can be implemented after athlete-starts if needed.

Age 14-15 rules:

- Athlete login is allowed.
- Guardian relationship is required.
- Athlete and guardian each have separate login credentials.
- Guardian consent is required before supervised access becomes active.
- Guardian identity verification is required before scout visibility, messaging, or sensitive sharing can activate.
- Athlete can draft messages to scouts.
- Messages are held until guardian approval.
- Guardian remains connected to messaging and information requests.
- Independent messaging is not available in this age band.

Age 14-15 guardian consent should confirm:

- Guardian authority.
- Consent for the athlete to have supervised profile access.
- Guardian approval requirement for outgoing athlete messages.
- Processing of athlete profile information for discovery and recruiting review.
- Visibility to verified scouts according to profile visibility settings.
- Possible verified scout access from Canada, the United States, or other countries.
- Agreement to the current Privacy Policy and Terms.

All required guardian consent items must be checked before supervised account activation.

### 16-17

- Athlete and guardian can jointly enable independent messaging.
- Independent messaging is not enabled automatically on the athlete's 16th birthday.
- If joint consent is not completed, guardian approval rules continue.
- In independent mode, guardian keeps oversight and safety permissions but does not approve routine scout communication.
- In supervised mode, the account follows the same approval pattern as 14-15.

## Age 16-17 Connected Signup Flow

For athletes aged 16-17, two signup paths are allowed:

1. Athlete starts signup and guardian approves by email.
2. Guardian starts signup and invites the athlete.

In both paths, the final account structure is:

```text
AthleteProfile
├── Athlete User Account
│   ├── athlete email
│   ├── athlete password
│   └── athlete profile and communication permissions
└── Guardian User Account
    ├── guardian email
    ├── guardian password
    └── oversight, consent, safety, and adult-transfer controls
```

The 16-17 flow adds a communication-mode decision:

```text
Communication mode:
├── supervised
│   ├── same approval pattern as 14-15
│   ├── athlete drafts messages and sensitive request responses
│   └── guardian approves before sensitive information is sent or shared
└── independent_with_guardian_consent
    ├── athlete manages scout communication directly
    ├── athlete responds to information requests directly
    ├── athlete shares requested recruiting media/documents directly
    └── guardian keeps view access, safety settings, consent controls, and adult-transfer controls
```

Independent mode is not active just because one side selected it. It requires both confirmations:

```text
Independent communication rule:
starter selects/request mode
guardian confirms independent communication permission
athlete confirms independent communication acceptance
if either side declines or does not confirm -> supervised mode
```

### Age 16-17 Mode Selection By Signup Path

Athlete starts:

```text
Athlete chooses 16-17
-> Athlete chooses "I am the athlete"
-> Athlete enters athlete login + guardian email
-> Athlete selects communication mode
   -> Supervised mode:
      guardian consent does not show independent-communication permission
      account activates with guardian approval queue
   -> Independent communication:
      guardian email consent includes independent-communication permission
      if guardian accepts -> independent mode active
      if guardian declines / does not confirm -> supervised mode active
-> Guardian can verify identity from the same email flow or choose Verify later
```

Guardian starts:

```text
Guardian chooses 16-17
-> Guardian chooses "I am a parent / guardian"
-> Guardian enters guardian login + athlete email
-> Guardian selects communication mode
   -> Supervised mode:
      athlete activation does not ask for independent communication
      account activates with guardian approval queue
   -> Independent communication:
      guardian consent includes independent-communication permission
      athlete activation asks athlete to accept or keep supervised mode
      if athlete accepts -> independent mode active
      if athlete declines -> supervised mode active
-> Guardian verifies identity now, or chooses Verify later
```

Guardian-start profile setup rule:

- Once the guardian has created their account, verified email if required, and completed guardian consent, the guardian can continue setting up the athlete profile.
- Guardian identity verification may be completed during signup or later.
- The profile does not need to remain fully draft/blocked only because the athlete has not activated their own login yet.
- Guardian can enter profile basics, manage guardian-controlled fields, set visibility, and potentially publish/profile-ready according to normal profile-readiness and visibility rules.
- Until the athlete activates their login, the profile behaves as guardian-controlled/supervised.
- Athlete-side access is pending until athlete activation.
- Independent communication cannot become active until the athlete accepts independent mode from the athlete activation link.
- If the athlete never activates, the profile can remain guardian-managed/supervised.

Product fallback rule:

- Supervised mode wins if either side declines independent communication.
- Supervised mode wins if either side does not complete the independent consent step.
- Independent communication can be requested again later from account settings, but still requires both confirmations.
- The account itself should still activate in supervised mode when independent mode is declined.

## Pending Email / Consent Rules

General rule:

```text
Profile work can continue in draft or limited mode while email verification, guardian consent, guardian identity verification, adult identity verification, or athlete activation is pending.
Publishing, search visibility, messaging, information-request responses, and sensitive sharing depend on the required verification/consent state.
```

Under 14:

- Guardian can start filling the athlete profile before guardian email verification is complete.
- Profile remains draft / not scout-visible until guardian email verification, guardian identity verification, and required consent are complete.
- Scout messaging and information requests are not active until guardian verification and consent are complete.

14-15 athlete starts:

- Athlete can create a limited account and start non-sensitive sport profile fields.
- Profile remains hidden/draft until guardian consent and guardian identity verification are complete.
- Messaging, information-request responses, scout visibility, and sensitive sharing are blocked until guardian consent and guardian identity verification are complete.

14-15 guardian starts:

- Guardian can continue profile setup after guardian account creation and consent.
- Guardian can verify identity now or later.
- Athlete invitation can remain pending.
- Athlete-side access is not active until the athlete accepts the invitation.
- Communication remains supervised.
- Scout visibility and messaging remain locked until guardian identity verification is complete.

16-17 athlete starts:

- Athlete can start non-sensitive sport profile fields while guardian consent is pending.
- Profile remains hidden/draft until guardian consent and guardian identity verification are complete.
- Independent mode is not active until guardian accepts independent communication.
- If guardian declines or does not confirm independent mode, supervised mode wins.

16-17 guardian starts:

- Guardian can continue profile setup after guardian consent.
- Guardian can verify identity now or later.
- Athlete activation can remain pending without blocking guardian-managed profile setup.
- Profile can become scout-visible if guardian identity verification, profile-readiness, and visibility rules are satisfied under guardian/supervised control.
- Athlete login, athlete-controlled profile work, and independent communication are not active until athlete activation.
- If independent mode was requested, it becomes active only after athlete acceptance; otherwise supervised mode applies.

18+:

- User can fill profile after signup.
- Email verification is required for account activation.
- Adult identity and age verification can be completed during signup or later.
- Profile should not become scout-visible until account email verification, adult identity verification, and profile-readiness/visibility requirements are met.
- Messaging, information-request responses, and sensitive sharing should not become active until account and adult identity verification are complete.

### Age 16-17 Field / Action Permissions

Athlete can manage directly in both modes:

- Non-sensitive sport profile information.
- Sport stats.
- Position / role.
- Club / team.
- Achievements.
- Playing history.
- Public recruiting media, unless the media is being shared through a sensitive request flow.

Guardian-only or guardian-managed fields:

- Guardian relationship settings.
- Guardian contact information.
- Consent and communication mode.
- Safety settings.
- Adult transfer / relationship transfer controls.
- Legal identity corrections.
- Date of birth correction.
- Account recovery and high-risk login/security changes.

Requires guardian approval in supervised mode:

- Scout messages.
- Information request responses.
- Sharing private/requested media or documents.
- Visibility settings.
- Contact details.
- Protected documents.
- Medical information.
- School records / transcripts.
- Sensitive personal fields.

Can be handled by the athlete in independent mode:

- Scout messages.
- Information request responses.
- Requested recruiting media/documents.
- Related recruiting follow-up.

In independent mode, guardian does not approve routine scout communication by default. Guardian remains connected with view access and safety controls, and can return the account to supervised mode if needed.

All required guardian consent items must be checked before the selected 16-17 permission mode can activate. If independent mode is requested, all required independent-mode consent items must also be checked.

### Editing Conflict Rule

For MVP, avoid letting athlete and guardian compete over the same sensitive live field.

```text
Low-risk sport data:
live value updates directly
last saved version wins
edit history is stored

Sensitive data in supervised mode:
live_value remains unchanged
athlete change creates pending_value
guardian approves / rejects / edits pending_value
approval writes pending_value to live_value

Guardian-only settings:
only guardian can edit
athlete can view if appropriate
```

Suggested field metadata:

```text
field_key
live_value
pending_value
pending_by_user_id
requires_guardian_approval
approved_by_guardian_id
last_updated_by_user_id
created_at
updated_at
approved_at
```

### 18+

- Athlete becomes eligible for adult account control.
- New adult athletes create an independent athlete account with their own email and password.
- No guardian consent, guardian approval queue, or guardian account is required.
- The athlete confirms account ownership, data processing, visibility, messaging, and platform terms.
- The athlete can fill profile information while email verification or adult identity verification is pending.
- The profile cannot become scout-visible until email verification, adult identity verification, profile-readiness rules, and the athlete's visibility setting allow it.
- Messaging, information-request responses, and sensitive sharing are controlled by the athlete once the account is active.
- If an existing minor profile ages into adult control, guardian access should not disappear silently.
- Adult transfer for existing minor profiles should require explicit confirmation.

## Suggested State Model

```text
AthleteProfile.management_mode:
- guardian_managed
- supervised
- independent

AthleteProfile.communication_mode:
- guardian_only
- guardian_approval_required
- independent_with_guardian_consent
- independent_adult

GuardianRelationship.status:
- pending
- verified
- revoked
- transferred
```

Optional implementation flags:

```text
guardian_verified: boolean
athlete_login_enabled: boolean
independent_messaging_enabled: boolean
adult_transfer_completed: boolean
```

## Under-14 Permission Matrix

| Action | Guardian | Athlete under 14 | Scout |
| --- | --- | --- | --- |
| Create athlete profile | Yes | No | No |
| Edit profile | Yes | No | No |
| Upload media/documents | Yes | No | No |
| Manage visibility | Yes | No | No |
| Read scout messages | Yes | No | Only messages they sent |
| Reply to scout | Yes | No | Yes |
| Respond to information request | Yes | No | Request only |
| Enable athlete login | Not before 14 | No | No |

## Age Transition Rules

### When athlete turns 14

- Do not automatically create athlete login.
- Guardian may invite the athlete to create supervised login.
- Communication mode can move from `guardian_only` to `guardian_approval_required`.

### When athlete turns 16

- Do not automatically enable independent messaging.
- Show joint consent option to athlete and guardian.
- If both consent, communication mode can become `independent_with_guardian_consent`.
- If not, approval-required mode continues.

### When athlete turns 18

- Offer adult account transfer.
- Athlete verifies account and accepts adult terms.
- Guardian access is removed or converted only through explicit transfer flow.

## MVP Notes

- MVP should use a third-party hosted identity verification provider for guardians of minor athletes and 18+ athletes.
- Verification can be skipped during signup and completed later, but scout visibility, messaging, information-request responses, and sensitive sharing remain locked until required verification is complete.
- Store only verification status, provider reference, verified result metadata, and timestamps unless legal review requires more.
- Full guardian portal is not required for MVP.
- Under-14 athlete login is not required for MVP.
- Audit records should store guardian consent and communication-mode changes.

## Future Notes

- Add richer guardian relationship proof if required by regulation or partner policy.
- Add guardian dashboard for managing multiple athlete profiles.
- Add multi-guardian support.
- Add more granular safety notifications for 16-17 athletes.
- Add formal adult transfer workflow with exportable consent history.
