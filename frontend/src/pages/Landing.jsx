function Landing() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">

          <h1 className="text-2xl font-bold">
            ASTU MSJ
          </h1>

          <nav className="flex items-center gap-8 text-sm">
            <span className="text-2xl cursor-pointer hover:text-blue-600">
              About
            </span>

            <span className="text-2xl cursor-pointer hover:text-blue-600">
              Tracks
            </span>

            <span className="text-2xl cursor-pointer hover:text-blue-600">
              Mentors
            </span>

            <span className=" text-2xl cursor-pointer hover:text-blue-600">
              FAQ
            </span>

            <span className="text-2xl cursor-pointer hover:text-blue-600">
              Contact
            </span>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-sm hover:text-blue-600"
            >
              Login
            </a>

            <a
              href="/register"
              className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Register
            </a>
          </div>

        </div>
      </header>


     
      <section className="max-w-7xl mx-auto px-8 py-28 text-center">

        <p className="text-sm font-semibold text-blue-600 mb-4">
          ASTU MSJ BOOTCAMP
        </p>

        <h2 className="text-5xl font-bold leading-tight">
          Learn. Build. Grow.
        </h2>

        <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-600">
          Develop your skills, work on real projects, and grow
          together with the ASTU MSJ community.
        </p>

        <div className="mt-8 flex justify-center gap-4">

          <a
            href="/register"
            className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>

          <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-white">
            Learn More
          </button>

        </div>

      </section>


      
      <section className="bg-white px-8 py-20">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold">
            About ASTU MSJ
          </h2>

          <p className="max-w-2xl mx-auto mt-5 text-gray-600">
            ASTU MSJ is a learning community designed to help
            students develop technical skills, collaborate on
            projects, and prepare for real-world opportunities.
          </p>

        </div>

      </section>


      
      <section className="max-w-7xl mx-auto px-8 py-20">

        <div className="text-center mb-12">

          <h2 className="text-3xl font-bold">
            Learning Tracks
          </h2>

          <p className="mt-3 text-gray-600">
            Explore different areas and build your skills.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl border hover:shadow-lg">
            <h3 className="text-xl font-semibold">
              Frontend Development
            </h3>

            <p className="mt-3 text-gray-600">
              Learn how to build modern and responsive web
              interfaces.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border hover:shadow-md">
            <h3 className="text-xl font-semibold">
              Backend Development
            </h3>

            <p className="mt-3 text-gray-600">
              Learn APIs, databases, authentication, and
              server-side development.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border hover:shadow-md">
            <h3 className="text-xl font-semibold">
              Full Stack Development
            </h3>

            <p className="mt-3 text-gray-600">
              Combine frontend and backend skills to build
              complete applications.
            </p>
          </div>

        </div>

      </section>


      
      <section className="bg-white px-8 py-20">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold">
            Our Mentors
          </h2>

          <p className="mt-4 text-gray-600">
            Learn from experienced developers and mentors.
          </p>

        </div>

      </section>


    
      <section className="max-w-5xl mx-auto px-8 py-20">

        <h2 className="text-3xl font-bold text-center">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 space-y-4">

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold">
              Who can join the bootcamp?
            </h3>

            <p className="mt-2 text-gray-600">
              Students interested in developing their technical
              and software development skills.
            </p>
          </div>

          <div className="bg-white border rounded-lg p-5">
            <h3 className="font-semibold">
              Do I need previous experience?
            </h3>

            <p className="mt-2 text-gray-600">
              No. The program can help you build your skills
              step by step.
            </p>
          </div>

        </div>

      </section>


    
      <section className="bg-gray-900 text-white px-8 py-20">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl font-bold">
            Contact Us
          </h2>

          <p className="mt-4 text-gray-300">
            Have questions? Get in touch with the ASTU MSJ team.
          </p>

          <button className="mt-7 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700">
            Contact Us
          </button>

        </div>

      </section>


      
      <footer className="bg-gray-950 text-gray-400 text-center py-6">
        <p className="text-sm">
          © 2026 ASTU MSJ. All rights reserved.
        </p>
      </footer>

    </main>
  );
}

export default Landing;