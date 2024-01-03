import React from "react";
import clsx from "clsx";
import styles from "./HomepageFeatures.module.css";

const FeatureList = [
  {
    title: "学习",
    Svg: require("../../static/img/undraw_docusaurus_mountain.svg").default,
    description: <>书山有路勤为径</>,
  },
  {
    title: "生活",
    Svg: require("../../static/img/undraw_docusaurus_tree.svg").default,
    description: <>诗和远方不可缺</>,
  },
  {
    title: "笔记",
    Svg: require("../../static/img/undraw_docusaurus_react.svg").default,
    description: <>习惯决定着成败</>,
  },
];

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} alt={title} />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
