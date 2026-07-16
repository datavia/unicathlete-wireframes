# Athlete Account Flow Schema

## Purpose

This document describes the athlete account creation flow as decision logic, and the age-transition logic for an athlete profile as the athlete moves from under 14 to 18+.

It is written as a product/developer schema. The wireframe version uses age-band buttons for review convenience, but the real product should calculate the age band from the athlete date of birth.

## Core Account Objects

```text
User
- account/auth identity
- owns login credentials

AthleteProfile
- public athlete product identity when visibility rules allow
- can be connected to one or more Users

ProfileUser
- relationship between a User and an AthleteProfile
- stores role, permissions, consent state, approval mode, and age-band access rules
```

Important rule:

```text
One AthleteProfile can have multiple connected Users.
Example: athlete user + guardian user.
The athlete and guardian must not share one email/password pair.
```

## Account Creation Decision Schema

### 1. Entry Point

```text
WHEN user starts Create Account
THEN show Choose Profile Type

IF profile_type = Professional / Scout
THEN route to Professional / Scout signup placeholder

IF profile_type = Athlete
THEN ask:
- athlete name
- athlete date of birth
THEN system calculates athlete age band
```

Age bands:

```text
IF age < 14
THEN age_band = under_14

IF age >= 14 AND age < 16
THEN age_band = 14_15

IF age >= 16 AND age < 18
THEN age_band = 16_17

IF age >= 18
THEN age_band = adult
```

## Under 14 Flow

### Rule

```text
IF athlete age is under 14
THEN guardian must create and manage the account.
Athlete does not get an independent login in MVP.
```

### Flow

```text
Create Account
-> Choose Athlete Profile
-> Enter athlete name + date of birth
-> System detects under_14
-> Guardian account details
   - guardian name
   - guardian email
   - guardian relationship
   - guardian password
-> Guardian consent
   - guardian authority
   - profile creation and management
   - data processing
   - scout visibility understanding
   - messages and requests handled by guardian
   - rights / withdrawal
   - Terms and Privacy
-> Guardian identity verification
   - Verify now OR Verify later
-> Athlete profile basics
-> Finish signup
```

### Resulting State

```text
AthleteProfile.management_mode = guardian_managed
AthleteProfile.connected_users = [guardian_user]
Athlete login = not enabled
Scout messages = handled by guardian
Information requests = handled by guardian
Scout visibility = locked until required readiness / consent / verification rules are satisfied
```

## Age 14-15 Flow

### Rule

```text
IF athlete age is 14-15
THEN athlete can have their own login,
BUT guardian connection is required
AND sensitive actions are supervised.
```

Sensitive supervised actions include:

```text
- scout messages
- information request responses
- visibility settings
- contact details
- protected documents
- sensitive fields
```

Non-sensitive athlete-editable areas can include:

```text
- sport profile basics
- stats
- position
- club/team
- achievements
- recruiting media
```

### 14-15 Path Choice

```text
WHEN system detects age_band = 14_15
THEN show:
- I am the athlete
- I am a parent / guardian
```

### 14-15 Athlete Starts

```text
IF starter = athlete
THEN collect:
- athlete email
- athlete password
- guardian name
- guardian email
- guardian relationship

THEN send guardian approval email

Guardian email contains:
- guardian consent form
- guardian identity verification entry point

IF guardian approves consent
THEN supervised account can activate

IF guardian chooses Verify later
THEN profile setup can continue,
BUT scout visibility, messaging, information requests, and sensitive sharing remain locked until verification is complete.

THEN athlete profile basics
THEN finish signup
```

Important:

```text
Do not ask for guardian password on athlete-start path.
The guardian is not creating a login inside the athlete's form.
Guardian approval happens through secure email.
```

### 14-15 Guardian Starts

```text
IF starter = guardian
THEN collect:
- guardian name
- guardian email
- guardian password
- guardian relationship
- optional athlete email for login invitation

THEN guardian consents inside platform
THEN guardian identity verification
   - Verify now OR Verify later
THEN athlete profile basics
THEN finish signup
```

If athlete email is provided:

```text
THEN athlete receives invitation email
THEN athlete can set their own password
THEN athlete user connects to the same AthleteProfile
```

If athlete email is not provided:

```text
THEN guardian can continue profile setup
AND athlete login remains pending until invited later.
```

### Resulting State

```text
AthleteProfile.management_mode = supervised
AthleteProfile.connected_users = [guardian_user, athlete_user if activated]
Guardian approval queue = active for sensitive actions
Independent messaging = not available
```

## Age 16-17 Flow

### Rule

```text
IF athlete age is 16-17
THEN athlete can have their own login
AND guardian remains connected
AND communication mode must be selected.
```

Communication modes:

```text
supervised_1617
- same approval pattern as 14-15
- guardian approval required for sensitive communication and sharing

independent_1617
- athlete can manage scout communication and recruiting information sharing directly
- requires guardian consent
- if guardian starts, athlete also sees and confirms the independent mode request from email
- if either side does not confirm, supervised mode wins
```

### 16-17 Path Choice

```text
WHEN system detects age_band = 16_17
THEN show:
- I am the athlete
- I am a parent / guardian

Also show rule note:
- guardian remains connected until adult transfer
- independent communication does not turn on automatically
- both sides must confirm independent communication
- supervised mode is fallback
```

### 16-17 Athlete Starts

```text
IF starter = athlete
THEN collect:
- athlete email
- athlete password
- guardian name
- guardian email
- guardian relationship
- requested communication mode
   - supervised_1617 OR independent_1617

THEN send guardian consent email

Guardian email contains:
- consent form
- consent points that change based on selected communication mode
- guardian identity verification entry point

IF requested mode = supervised_1617
THEN guardian consent does not include independent-communication permission

IF requested mode = independent_1617
THEN guardian consent includes independent-communication permission

IF guardian does not approve independent communication
THEN account uses supervised_1617

THEN athlete profile basics
THEN finish signup
```

### 16-17 Guardian Starts

```text
IF starter = guardian
THEN collect:
- guardian name
- guardian email
- guardian password
- guardian relationship
- athlete email for activation invitation
- requested communication mode
   - supervised_1617 OR independent_1617

THEN show athlete invitation email preview on the same page
   - athlete receives secure activation link
   - athlete creates their own password from email
   - if independent_1617 was requested, athlete sees:
      - Accept independent communication
      - Keep supervised mode
```

Then:

```text
THEN guardian consent
THEN guardian identity verification
   - Verify now OR Verify later
THEN athlete profile basics
THEN finish signup
```

Independent-mode result:

```text
IF guardian requested independent_1617
AND guardian consent includes independent permission
AND athlete accepts independent communication from email
THEN AthleteProfile.management_mode = independent_with_guardian_connection

ELSE AthleteProfile.management_mode = supervised_1617
```

### Resulting State

```text
AthleteProfile.connected_users = [athlete_user, guardian_user]
Guardian remains connected until adult transfer

IF communication_mode = supervised_1617
THEN guardian approval queue remains active for sensitive actions

IF communication_mode = independent_1617
THEN athlete handles scout communication directly
AND guardian keeps oversight / safety / consent / adult-transfer controls
```

## Age 18+ Flow

### Rule

```text
IF athlete age is 18+
THEN athlete creates and manages their own account.
No guardian approval flow applies to new adult athlete accounts.
```

### Flow

```text
Create Account
-> Choose Athlete Profile
-> Enter athlete name + date of birth
-> System detects adult
-> Adult account details
   - athlete email
   - password
-> Adult consent
   - account ownership
   - data processing
   - visibility understanding
   - messaging / information request independence
   - Terms and Privacy
-> Adult identity verification
   - Verify now OR Verify later
-> Athlete profile basics
-> Finish signup
```

### Resulting State

```text
AthleteProfile.management_mode = independent_adult
AthleteProfile.connected_users = [athlete_user]
Guardian role = not applicable for new adult account
Athlete controls profile, visibility, messages, and information requests
Scout visibility = locked until required readiness / consent / verification rules are satisfied
```

## Age Transition Flow: Under 14 To 18+

Age transitions should not silently change permissions. They should create available upgrade/transfer actions.

## Transition At Age 14

### Before 14

```text
AthleteProfile.management_mode = guardian_managed
Athlete login = disabled
Guardian manages profile, messages, information requests, visibility, and sensitive data
```

### When Athlete Turns 14

```text
WHEN athlete reaches 14
THEN system can show guardian an option:
"Invite athlete to supervised access"

No automatic permission change.
```

If guardian does nothing:

```text
Profile remains guardian_managed
Athlete login remains disabled
Guardian continues managing the profile
```

If guardian invites athlete:

```text
Guardian enters athlete email
Athlete receives secure invitation
Athlete creates password
Athlete user is linked to existing AthleteProfile
AthleteProfile.management_mode becomes supervised
```

After supervised access is enabled:

```text
Athlete can edit allowed non-sensitive profile areas
Athlete can draft messages / request responses
Guardian approval remains required for sensitive actions
Guardian remains connected
```

## Transition At Age 16

### Before 16

```text
AthleteProfile.management_mode = supervised
Guardian approval required for sensitive actions
Independent communication unavailable
```

### When Athlete Turns 16

```text
WHEN athlete reaches 16
THEN system can show athlete and guardian an option:
"Request independent communication"

No automatic permission change.
```

If neither side requests independent mode:

```text
Account remains supervised
Guardian approval queue remains active
```

If independent mode is requested:

```text
Guardian must consent to independent communication
Athlete must accept independent communication

IF both confirm
THEN communication_mode = independent_1617

IF either declines or does not confirm
THEN communication_mode = supervised_1617
```

When independent mode is active:

```text
Athlete can manage scout messages directly
Athlete can respond to information requests directly
Athlete can share requested recruiting media/documents directly
Guardian remains connected for oversight, safety settings, consent controls, and adult-transfer controls
```

## Transition At Age 18

### Before 18

Possible pre-18 states:

```text
guardian_managed
supervised
independent_1617 with guardian connected
```

### When Athlete Turns 18

```text
WHEN athlete reaches 18
THEN system should offer adult account transfer.

No guardian access should disappear silently.
```

Adult transfer should require:

```text
- athlete confirmation
- adult Terms / Privacy acceptance
- adult identity / age verification
- confirmation of what happens to guardian access
```

Possible transfer outcomes:

```text
IF adult transfer completed
THEN AthleteProfile.management_mode = independent_adult
AND athlete becomes primary account controller

IF guardian access is removed
THEN remove guardian permissions after explicit confirmation

IF guardian access is converted
THEN guardian becomes limited viewer/helper only if athlete explicitly allows it

IF adult transfer is not completed
THEN keep previous safe state until resolved
BUT do not grant new adult-only permissions silently
```

## Permission Matrix By Age State

| State | Athlete login | Guardian required | Messaging | Info requests | Profile management |
| --- | --- | --- | --- | --- | --- |
| Under 14 / guardian managed | No | Yes | Guardian handles | Guardian handles | Guardian manages |
| 14-15 / supervised | Yes, if invited/activated | Yes | Athlete drafts, guardian approves | Guardian approval required | Shared, sensitive fields guarded |
| 16-17 / supervised | Yes | Yes | Athlete drafts, guardian approves | Guardian approval required | Shared, sensitive fields guarded |
| 16-17 / independent | Yes | Yes, connected | Athlete handles directly | Athlete handles directly | Athlete manages more directly; guardian keeps oversight controls |
| 18+ / adult | Yes | No | Athlete handles directly | Athlete handles directly | Athlete manages |

## Visibility Rule Across All Ages

```text
Account/profile creation does not automatically make the athlete scout-visible.

Scout visibility depends on:
- required consent
- required verification
- profile readiness
- selected visibility settings
- age-based permission state
```

## Implementation Notes

- Age should be calculated from date of birth, not selected manually.
- The wireframe uses age-band buttons only to make review easier.
- The system should store the athlete's age band as a derived state, not a user-editable truth.
- Age transitions should be event-driven checks, for example daily job or login-time check.
- Age transitions should create pending actions, not silently change permissions.
- Store consent version, Terms version, Privacy version, timestamp, and actor for each meaningful permission change.
- Store guardian/athlete relationship state in `ProfileUsers[]`.
- Use `management_mode` and `communication_mode` as explicit state values rather than inferring permissions only from age.
