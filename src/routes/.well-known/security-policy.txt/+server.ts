import { ORIGIN } from '$env/static/private';
import { text } from '@sveltejs/kit';

const policy = `Thank you for your interest in reporting security issues. This project is a hobby, open-source effort maintained by volunteers.

Scope
- This policy applies to the public services hosted at ${ORIGIN} and related infrastructure maintained in this repository.

Reporting
- If you believe you've discovered a security vulnerability, please contact: mailto:nhajeho1@gmail.com
- Provide a clear description of the issue, steps to reproduce, and any PoC code or logs you can safely share.

Resolution and Rewards
- We appreciate responsible disclosure and will triage and fix confirmed issues as time and resources permit.
- This is a hobby open-source project. No monetary reward or bounty will be offered for reports. By reporting an issue you acknowledge there is no expectation of payment.

Thank you and have a nice day!
`;

export const GET = async () => {
	return text(policy);
};
