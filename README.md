# Braude Top

Braude Top is a Timetable creation tool built with sveltekit for students of the [Braude college](https://w3.braude.ac.il/) for engineering. It is not affiliated with the college in any way.

## Features

- **Timetable Creation**: Create separate Timetables for each semester.
- **Course Search**: Search for courses by partial name.
- **Light/Dark Mode**: Toggle between light and dark themes for better usability.
- **User Feedback**: Users can submit feedback, requests, or bug reports directly through the site.
- **Course Comments**: Add and view comments on course information pages.
- **Responsive Design**: Optimized for desktop and mobile devices.

## Tech Stack

- **Frontend**: [SvelteKit 5](https://kit.svelte.dev)
- **Backend**: Node server using SvelteKit's node adapter. SQLite as DB engine.
- **Hosting**: Hosted on a Linode VPS with Nginx as a reverse proxy. [Check it out!](https://braude.top)

## Development

### Prerequisites

- Linux (can technically run on Windows, but all scripts are written for Linux, so some tinkering may be required)
- Node.js (v20+)
- npm

### Setup

1.  Clone the repository:

```bash
git clone https://github.com/yuval-herman/braude-top.git
```

2. Navigate to the project directory:

```bash
cd braude-top
```

3. Install dependencies:

```bash
npm install
```

4. Install playwright dependencies:

```bash
npx playwright install
```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser at [http://localhost:5173](http://localhost:5173).

### Building for Production

Generate a production build:

```bash
npm run build
```

Preview the build:

```bash
npm run preview
```

## Deployment

Braude Top is deployed on Linode with two builds:

- **Beta Build**: Accessible via the `beta` subdomain.
- **Production Build**: Accessible via the primary domain.

## Feedback and Contributions

Feedback and contributions are welcome! If you encounter any issues or have suggestions, please open an issue or submit a pull request.
