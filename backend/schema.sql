-- DDL para VincuLab (4FN + ACID)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role ENUM('STUDENT','COMPANY','SCHOOL','ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
-- 4FN: cada usuario es una entidad única; role no se repite en otra tabla y no hay atributos multivaluados.

CREATE TABLE IF NOT EXISTS school_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_name VARCHAR(255) NOT NULL,
  director_name VARCHAR(255) NOT NULL,
  cue VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  decided_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
-- 4FN: solo guarda el estado de la solicitud; datos de la escuela no se replican luego en users ni schools.

CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  name VARCHAR(255) NOT NULL,
  director_name VARCHAR(255) NOT NULL,
  cue VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_schools_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
-- 4FN: una fila por escuela, user_id referencia única. Sin multivalores.

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  school_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  skills TEXT,
  description TEXT,
  cv_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_students_school FOREIGN KEY (school_id) REFERENCES schools(id)
) ENGINE=InnoDB;
-- 4FN: cada atributo depende de la clave (id). school_id normaliza pertenencia evitando flags duplicados.

CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  legal_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(30) NOT NULL,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  address VARCHAR(255),
  city VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
-- 4FN: datos corporativos aislados; sin atributos multivaluados.

CREATE TABLE IF NOT EXISTS verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  school_id INT NOT NULL,
  status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  decided_at TIMESTAMP NULL,
  CONSTRAINT fk_verif_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_verif_school FOREIGN KEY (school_id) REFERENCES schools(id)
) ENGINE=InnoDB;
-- 4FN: estado derivado único, evita flags en users; sin repetición de estados en otras tablas.

CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  specialty VARCHAR(100),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  location VARCHAR(120),
  modality VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_offer_company FOREIGN KEY (company_id) REFERENCES companies(id)
) ENGINE=InnoDB;
-- 4FN: cada oferta pertenece a una empresa; atributos no multivaluados.

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  offer_id INT NOT NULL,
  status ENUM('SENT','REVIEWING','ACCEPTED','REJECTED') DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL,
  CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_app_offer FOREIGN KEY (offer_id) REFERENCES offers(id)
) ENGINE=InnoDB;
-- 4FN: estado de postulación solo aquí; no se duplica en offers ni users; sin multivalores.
