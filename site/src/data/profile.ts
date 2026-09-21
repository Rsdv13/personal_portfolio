export const profile = {
  name: 'Sudharsan Ragothaman',
  role: 'Data Engineer',
  tagline: 'Data Engineer building reliable pipelines, cloud-scale analytics, and AI-agent systems.',
  location: 'Dallas, TX, USA',
  email: 'sudharsan.nitt@gmail.com',
  phone: '(470)-772-7062',
  linkedin: 'https://www.linkedin.com/in/sudharsan-ragothaman/',
  github: 'https://github.com/Rsdv13',
  summary:
    "I'm a Data Engineer with a Master's in Engineering Data Science and 4+ years of professional experience (5+ including internship), working at the intersection of cloud data platforms and applied AI. I design Snowflake data marts and ELT pipelines for enterprise clients, build LLM-powered agent systems, and ship real-time BI. Previously I worked as a Data Scientist building GenAI applications with LangChain and LLMs. My background spans data engineering, machine learning, and computer vision, with hands-on research in drone-based object detection and satellite image segmentation.",
} as const

export type ExperienceEntry = {
  title: string
  company: string
  location: string
  period: string
  story: string
  highlights: string[]
}

export const experience: ExperienceEntry[] = [
  {
    title: 'Data Engineer',
    company: 'Javen Technologies (Client: Solventum)',
    location: 'Minneapolis, MN',
    period: 'Jul 2024 – Present',
    story:
      "Sudharsan joined Javen Technologies in mid-2024 to help modernize Solventum's Snowflake data platform. He rebuilt their core data marts around dimensional modeling and clustering keys, then layered in incremental ELT pipelines — Tasks, Streams, change data capture — so the OTC, Commercial Ops, and MDM datasets stay fresh without expensive full reloads. He leaned on Time Travel and zero-copy cloning to make regression testing safe on production-scale data, and shipped real-time Power BI dashboards the business actually relies on. More recently, he's been pushing the team into AI territory: prototyping a multi-agent orchestration proof of concept on Azure AI Foundry, and building a monitoring framework — golden-question tests plus an LLM-as-judge layer — to keep an internal Microsoft Fabric data agent honest and accurate.",
    highlights: [
      'Snowflake data marts & ELT',
      'Real-time Power BI',
      'Multi-agent AI (Azure AI Foundry)',
      'LLM-as-judge monitoring',
    ],
  },
  {
    title: 'Data Scientist',
    company: 'Trovadatum Inc',
    location: 'Georgia, USA',
    period: 'Feb 2023 – Jul 2024',
    story:
      "Before that, as a Data Scientist at Trovadatum, Sudharsan spent his days in Python, SQL, and Spark — running EDA across operational databases and building Kafka-fed Spark pipelines on Databricks, orchestrated with Airflow. The project he's proudest of from that stretch is the \"Resume Bot,\" a LangChain-powered GenAI app that turned a static résumé into something people could actually talk to — the direct inspiration for the AI agent on this site. He also researched and built an LLM-based customer service bot, comparing Llama 2 and OpenAI models to find the right fit for the client.",
    highlights: [
      'LangChain "Resume Bot"',
      'LLM customer service bot',
      'Spark + Kafka on Databricks',
      'Airflow orchestration',
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
