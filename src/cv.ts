import cvData from '../cv.json';

// Extraire les données avec des valeurs par défaut pour les propriétés optionnelles
const {
    basics,
    work = [],
    education = [],
    skills = [],
    projects = [],
    certificates = []
} = cvData;

// Exporter les données
export {
    basics,
    work,
    education,
    skills,
    projects,
    certificates
};

export default cvData;
