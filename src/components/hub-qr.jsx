import React from "react"
import QRious from 'qrious'

class HubQr extends React.Component {
    shouldComponentUpdate(nextProps) {
        //console.log(this.props.url, nextProps.url, this.props.url != nextProps.url)
        return this.props.url != nextProps.url
    }

    render() {
        const {
            url,
            size
        } = this.props

        const quickconnect = url.split('#quick-connect=')[1]
        const qr = new QRious({
            value: url,
            size,
        })

        console.log(url)
        const dataUrl = qr.toDataURL()

        return (
            <img src={dataUrl} style={{margin: "auto"}}/>
        )
    }
}

export default HubQr
