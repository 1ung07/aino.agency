import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import About from './pages/About.jsx'
import ContactPage from './pages/ContactPage.jsx'
import Home from './pages/Home.jsx'
import Pakku from './pages/Pakku.jsx'
import Play from './pages/Play.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Services from './pages/Services.jsx'
import Snekst from './pages/Snekst.jsx'
import Textris from './pages/Textris.jsx'
import Work from './pages/Work.jsx'
import CaseDetail from './pages/work/CaseDetail.jsx'
import { caseStudiesByPath } from './data/caseStudies.js'
import { serviceDetailsByPath } from './data/serviceDetails.js'
import { routes } from './routes.js'

const pagesByPath = {
  '/': Home,
  '/about': About,
  '/contact': ContactPage,
  '/play': Play,
  '/play/pakku': Pakku,
  '/play/snekst': Snekst,
  '/play/textris': Textris,
  '/services': Services,
  '/work': Work,
}

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ path, title, pageClass }) => {
            const Page = pagesByPath[path]
            const caseStudy = caseStudiesByPath.get(path)
            const serviceDetail = serviceDetailsByPath.get(path)

            return (
              <Route
                key={path}
                path={path}
                element={
                  Page ? (
                    <Page />
                  ) : caseStudy ? (
                    <CaseDetail slug={caseStudy.slug} />
                  ) : serviceDetail ? (
                    <ServiceDetail slug={serviceDetail.slug} />
                  ) : (
                    <PageShell title={title} className={pageClass} />
                  )
                }
              />
            )
          })}
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/work/:id" element={<CaseDetail />} />
          <Route path="*" element={<PageShell title="Not Found" className="page" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

const PageShell = ({ title, className }) => (
  <main id="app" className={`page ${className}`}>
    <section className="section first">
      <div className="col w6">
        <h1 className="mega">{title}</h1>
      </div>
    </section>
  </main>
)

export default App
