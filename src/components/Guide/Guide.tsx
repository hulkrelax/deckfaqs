import React from 'react'
import styles from './Guide.module.css'

type GuideProps = {
    url: string
    text: string | undefined
}

export const Guide = ({ url, text }: GuideProps) =>
    text ? (
        <div className={styles.plain}>
            <pre>{text}</pre>
        </div>
    ) : (
        <iframe className={styles.guide} src={url} sandbox="" />
    )
