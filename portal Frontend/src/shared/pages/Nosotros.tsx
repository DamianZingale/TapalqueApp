import { Container, Row, Col, Card } from 'react-bootstrap';

export const Nosotros = () => {
  return (
    <Container className="py-5">
      <title>Sobre Nosotros | Tapalqué App</title>
      <meta name="description" content="Conocé el equipo detrás de Tapalqué App. Plataforma digital que conecta residentes, comerciantes y visitantes con la ciudad de Tapalqué." />
      <link rel="canonical" href="https://tapalqueapp.com.ar/nosotros" />
      <h1 className="mb-4">Sobre Nosotros</h1>

      <section className="mb-5">
        <h2 className="h3 mb-3">Bienvenidos a Tapalqué App</h2>
        <p className="lead">
          Somos una plataforma digital dedicada a promover y difundir todo lo que
          Tapalqué tiene para ofrecer, conectando a residentes, comerciantes y
          visitantes con los servicios, comercios y atractivos de nuestra ciudad.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h3 mb-3">Nuestra Misión</h2>
        <p>
          Facilitar el acceso a la información sobre comercios, gastronomía, hospedajes,
          servicios, eventos y espacios públicos de Tapalqué, fortaleciendo el vínculo
          entre la comunidad local y quienes nos visitan.
        </p>
        <p>
          Buscamos ser el punto de encuentro digital que impulse el desarrollo económico
          local y mejore la experiencia de todos los que viven o visitan nuestra ciudad.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h3 mb-3">¿Qué Ofrecemos?</h2>
        <Row className="g-4">
          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Directorio Completo</Card.Title>
                <Card.Text>
                  Información actualizada sobre comercios, gastronomía, hospedajes y
                  servicios de Tapalqué en un solo lugar.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Eventos y Actividades</Card.Title>
                <Card.Text>
                  Mantente informado sobre los eventos, actividades y celebraciones
                  que se realizan en la ciudad.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Espacios Públicos</Card.Title>
                <Card.Text>
                  Descubre los espacios públicos, plazas y lugares de interés que
                  hacen especial a nuestra ciudad.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Termas de Tapalqué</Card.Title>
                <Card.Text>
                  Información completa sobre nuestro principal atractivo turístico,
                  las Termas de Tapalqué.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Plataforma para Comerciantes</Card.Title>
                <Card.Text>
                  Los comerciantes locales pueden registrar y gestionar sus negocios,
                  aumentando su visibilidad.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="h5">Acceso Gratuito</Card.Title>
                <Card.Text>
                  Toda la información disponible de forma gratuita y accesible para
                  toda la comunidad.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <h2 className="h3 mb-3">Sobre Tapalqué</h2>
        <p>
          Tapalqué es una ciudad ubicada en el centro de la provincia de Buenos Aires,
          Argentina. Con una rica historia, una comunidad cálida y acogedora, y el
          privilegio de contar con sus reconocidas Termas, nuestra ciudad se ha
          convertido en un destino atractivo tanto para el turismo como para quienes
          buscan calidad de vida.
        </p>
        <p>
          Nuestra ciudad combina la tranquilidad del interior con servicios de calidad,
          comercios diversos, gastronomía variada y atractivos turísticos que invitan
          a conocerla y disfrutarla.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h3 mb-3">El Equipo</h2>
        <p>
          Tapalqué App fue desarrollada por profesionales comprometidos con el
          crecimiento de nuestra comunidad, combinando tecnología y conocimiento
          local para crear una herramienta útil y accesible para todos.
        </p>
        <Row className="mt-4">
          <Col md={6} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title className="h5">Damian Zingale</Card.Title>
                <Card.Text className="text-muted">Desarrollador</Card.Text>
                <a
                  href="https://www.linkedin.com/in/damian-zingale-7a89bb114/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  LinkedIn
                </a>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="shadow-sm">
              <Card.Body className="text-center">
                <Card.Title className="h5">Santiago Lamot</Card.Title>
                <Card.Text className="text-muted">Desarrollador</Card.Text>
                <a
                  href="https://www.linkedin.com/in/santiago-lamot-/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  LinkedIn
                </a>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <h2 className="h3 mb-3">¿Querés que tu Comercio Aparezca en la App?</h2>
        <p>
          Si tenés un comercio, restaurant, hospedaje o servicio en Tapalqué y
          querés formar parte de nuestra plataforma, contactanos por WhatsApp o
          email. Con gusto te ayudaremos a sumar tu negocio a Tapalqué App.
        </p>

        <Row className="mt-4">
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="h5">Damian Zingale</Card.Title>
                <div className="mb-2">
                  <a
                    href="https://wa.me/542281532855"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm me-2 mb-2"
                  >
                    <i className="bi bi-whatsapp"></i> WhatsApp
                  </a>
                  <a
                    href="mailto:damianzingale@gmail.com"
                    className="btn btn-outline-primary btn-sm mb-2"
                  >
                    <i className="bi bi-envelope"></i> Email
                  </a>
                </div>
                <small className="text-muted">Tel: 2281-532855</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="h5">Santiago Lamot</Card.Title>
                <div className="mb-2">
                  <a
                    href="https://wa.me/542281683888"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success btn-sm me-2 mb-2"
                  >
                    <i className="bi bi-whatsapp"></i> WhatsApp
                  </a>
                  <a
                    href="mailto:santiagolamot25@gmail.com"
                    className="btn btn-outline-primary btn-sm mb-2"
                  >
                    <i className="bi bi-envelope"></i> Email
                  </a>
                </div>
                <small className="text-muted">Tel: 2281-683888</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-4">
        <h2 className="h3 mb-3">Contacto General</h2>
        <p>
          Si tenés preguntas, sugerencias o necesitás ayuda con la plataforma,
          podés contactarnos a través de los medios indicados arriba. Estamos
          para ayudarte.
        </p>
      </section>

      <div className="bg-light p-4 rounded text-center">
        <p className="mb-0">
          <strong>Tapalqué App</strong> - Conectando nuestra ciudad con el mundo
        </p>
      </div>
    </Container>
  );
};
