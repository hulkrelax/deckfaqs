import React from 'react'

type GuideProps = {
    url: string | undefined
    text: string | undefined
}

const guideStyle = {
    border: 'none',
    overflow: 'hidden',
    height: '100%',
}

export const Guide = ({ url, text }: GuideProps) => {
    return text ? (
        <div style={{ height: '100%', overflowY: 'scroll' }}>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{text}</pre>
        </div>
    ) : (
        <div style={{ height: '400px' }}>
            <iframe src={url} style={guideStyle} sandbox="" />
        </div>
    )
}
