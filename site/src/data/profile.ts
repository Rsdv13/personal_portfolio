export const profile = {
  name: 'Sudharsan Ragothaman',
  role: 'Data Engineer',
  tagline: 'Data Engineer building reliable pipelines, cloud-scale analytics, and AI-agent systems.',
  location: 'Minneapolis, MN, USA',
  email: 'sudharsan.nitt@gmail.com',
  phone: '(470)-772-7062',
  linkedin: 'https://www.linkedin.com/in/sudharsan-ragothaman/',
  github: 'https://github.com/Rsdv13',
  summary:
    "I'm a Data Engineer with a Master's in Engineering Data Science, working at the intersection of cloud data platforms and applied AI. I design Snowflake data marts and ELT pipelines for enterprise clients, build LLM-powered agent systems, and ship real-time BI. Previously I worked as a Data Scientist building GenAI applications with LangChain and LLMs. My background spans data engineering, machine learning, and computer vision, with hands-on research in drone-based object detection and satellite image segmentation.",
} as const

export type ExperienceEntry = {
  title: string
  company: string
  location: string
  period: string
  bullets: string[]
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Data Engineer',
    company: 'Javen Technologies (Client: Solventum)',
    location: 'Minneapolis, MN',
    period: 'Jul 2024 – Present',
    bullets: [
      'Designed and optimized Snowflake data marts using dimensional modeling, clustering keys, and materialized views, enabling high-performance querying across OTC, Commercial Ops, and MDM datasets.',
      'Built incremental ELT pipelines using Snowflake Tasks + Streams, implementing change data capture and dependency-driven processing for staging, transformation, and upsert layers.',
      'Developed complex SQL queries, stored procedures, and dynamic SQL frameworks to perform investigative data analysis and automate metadata-driven transformations.',
      'Utilized Time Travel and zero-copy cloning for safe data recovery, point-in-time comparisons, regression testing, and parallel QA environments with zero impact on production data.',
      'Performed large-scale query optimization and data profiling across multi-million record datasets to identify anomalies, improve performance, and ensure data reliability.',
      'Delivered real-time Power BI dashboards via Snowflake DirectQuery, with DAX-based KPIs, row-level security, and semantic model optimization for fast and secure stakeholder access.',
      'Architected a multi-agent orchestration proof-of-concept on Azure AI Foundry using the Microsoft Agent Framework (MAF) to coordinate specialist agents via AIProjectClient, demonstrating scalable orchestration patterns for enterprise data workflows.',
      'Built a monitoring and validation framework for a Microsoft Fabric Data Agent, combining a golden-question test suite, an LLM-as-judge evaluation layer, and automated freshness checks with Teams Adaptive Card alerting to keep AI-driven data responses accurate and current.',
      'Used GitHub for version control and Jira for sprint/project management, integrating CI/CD practices and environment-specific branching strategies across IICS, Snowflake, and Power BI artifacts.',
    ],
  },
  {
    title: 'Data Scientist',
    company: 'Trovadatum Inc',
    location: 'Georgia, USA',
    period: 'Feb 2023 – Jul 2024',
    bullets: [
      'Conducted exploratory data analysis (EDA) and large-scale data manipulation using Python (Pandas, NumPy) and SQL across operational and analytics databases.',
      'Built an AI-powered "Resume Bot" — a GenAI application using an LLM and LangChain to turn a static resume into an interactive, conversational experience.',
      'Created an end-to-end LLM project, researching models like Llama 2 Chat and OpenAI to build an interactive customer-service care bot for a client.',
      'Built interactive Jupyter notebooks to analyze model performance, data distributions, and feature behavior.',
      'Developed Apache Spark code on Databricks as part of data exploration, with data streaming from Snowflake via Kafka and pipelines automated with Airflow.',
    ],
  },
]

export type ResearchEntry = {
  title: string
  bullets: string[]
}

export const research: ResearchEntry[] = [
  {
    title: 'Cloud-Controlled Drone Computer Vision Model',
    bullets: [
      'Used AWS SageMaker to develop a state-of-the-art ML model for object detection during drone operations, stored in S3, improving detection accuracy by 40%.',
      'Implemented Lambda functions and API Gateway to automate object-detection inference on camera images in S3, reducing manual intervention by 90%.',
    ],
  },
  {
    title: 'Deep Learning Land Cover Classification Using Satellite Imagery',
    bullets: [
      'Built a multi-class image segmentation model for land cover prediction in environmental monitoring, improving segmentation accuracy by 90%.',
      'Led U-Net and DeepLabV3+ implementation to address dataset class imbalance, experimenting with cross-entropy, Dice, and Tversky loss functions.',
    ],
  },
  {
    title: 'Audio and Text Sentiment Analysis with Speech Emotion Classification',
    bullets: [
      'Used the Google API to convert audio to text and ran sentiment analysis on a speech-emotion dataset.',
      'Compared supervised models (Naive Bayes, Decision Tree) and built a hybrid model reaching 91.9% accuracy.',
    ],
  },
]

export type EducationEntry = {
  degree: string
  school: string
  period: string
  gpa: string
  detail: string
}

export const education: EducationEntry[] = [
  {
    degree: 'Master of Science, Engineering Data Science',
    school: 'University of Houston, Houston, Texas, USA',
    period: 'Aug 2021 – Dec 2022',
    gpa: '3.70 / 4.0',
    detail: 'Computer Vision, Machine Learning Models, Probability and Statistics for ML, Deep Learning',
  },
  {
    degree: 'Bachelor of Technology, Mechanical Engineering',
    school: 'National Institute of Technology, Trichy',
    period: 'Jul 2017 – May 2021',
    gpa: '3.2 / 4.0',
    detail: 'Data Analytics, Computational Techniques, Optimization Techniques, Intro to C++, CS with Python',
  },
]

export const skills = {
  'Programming Languages': ['Python', 'C++', 'MATLAB', 'HTML', 'XML', 'JavaScript', 'SQL'],
  'Software & Tools': ['AWS', 'Jupyter Notebook', 'PyCharm', 'VS Code', 'Unix', 'Git', 'Excel', 'Power BI', 'IICS'],
  'Machine Learning': ['NumPy', 'Scikit-learn', 'Pandas', 'PyTorch', 'OpenCV', 'SciPy', 'Matplotlib', 'boto3', 'TensorFlow', 'NLP', 'LangChain', 'LLM Agents'],
  'Data & Big Data': ['Snowflake', 'Spark', 'Databricks', 'HDFS', 'MySQL', 'Kafka Streaming', 'Airflow', 'Tableau'],
  'Cloud Services': ['AWS S3', 'EC2', 'AWS EMR', 'SageMaker', 'AWS Glue', 'Azure AI Foundry', 'Microsoft Fabric'],
} as const

export const achievements = [
  'Snowflake SnowPro Core Certified',
  'Python PCEP Certified',
  'Bronze medalist, World Taekwondo Federation of India tournament',
]
