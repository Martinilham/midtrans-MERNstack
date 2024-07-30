import { useState, useEffect } from "react";
import Items from "../../../components/Items";
import { jwtDecode as jwt_decode } from 'jwt-decode';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const OrderInformation = () => {
  const [pesanan, setPesanan] = useState([]);
  const [totalOrder, setTotalOrder] = useState(0);
  const [dataClient, setDataClient] = useState({});
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [tanggalWaktuString, setTanggalWaktuString] = useState('');
  const api_link = process.env.REACT_APP_API_SECRET

//   useEffect(() => {
//     moment.locale('id');
//     const sekarang = moment();
//     const formatTanggalWaktu = sekarang.format('dddd');
//     const tanggal = sekarang.format('D MMMM YYYY HH:mm:ss')
//     const konversi=hariMapping[formatTanggalWaktu]
//     const tangaglan = `${konversi},${tanggal}`
//     setTanggalWaktuString(tangaglan);
//   }, []);

//   const generateOrderId = () => {
//     const timestamp = Date.now();
//     const randomSegment = Math.random().toString(36).substr(2, 9);
//     return `ORD-${timestamp}-${randomSegment}`;
//   };

//   useEffect(() => {
//     const storedPesanan = localStorage.getItem("pesanan");
//     if (storedPesanan) {
//       setPesanan(JSON.parse(storedPesanan));
//     }
//   }, []);

//   useEffect(() => {
//     const total = pesanan.reduce((acc, item) => acc + item.qty * item.harga, 0);
//     setTotalOrder(total);
//   }, [pesanan]);


  const pembayaran = async (e) => {
    e.preventDefault();
    if (!dataClient || !pesanan.length) {
      console.error("Data client atau pesanan tidak tersedia.");
      return;
    }

    const pembayaranONLINE = {
      orderId: generateOrderId(),
      total: totalOrder,
    };

    try {
      const response = await axios.post(
        `${api_link}/api/paymnet/pembayaran-online`,
        pembayaranONLINE,
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );
      setToken(response.data.token);
    } catch (error) {
      console.error('Error initiating payment:', error.response ? error.response.data : error.message);
    }
  };


  useEffect(() => {
    if (token) {
      window.snap.pay(token, {
        onSuccess: async (result) => {

          const convertedItems = pesanan.map(item => ({
            produk_id: item.id,
            namaproduk: item.fname,
            kategori:item.kategori,
            harga: item.harga,
            diskon: item.diskon,
            jumlah: item.qty
          }));
          

          const pesan = {
            idpemesan: dataClient.userId,
            orderId: generateOrderId(),
            namapemesan: dataClient.userName,
            items: convertedItems,
            alamat: dataClient.alamatClient,
            notlpn: dataClient.notlp,
            total: totalOrder,
            statusbayar: "success",
            statusditerima: "processing",
            tglorder: tanggalWaktuString
          };

          try {
            await axios.post(`/api/proxy/pesanan`, pesan, {
              headers: {
                "Content-Type": "application/json"
              }
            });

            // await axios.put(`${api_link}kurangi-stok`, { items: convertedItems }, {
            //   headers: {
            //     "Content-Type": "application/json"
            //   }
            // });

            localStorage.setItem("transaksi", JSON.stringify(pesan));
            navigate("/detailorder");
          } catch (error) {
            console.error("Error posting order:", error);
          }
        },
        onPending: (result) => {
          console.log("Payment pending:", result);
        },
        onError: (error) => {
          console.log("Payment error:", error);
        },
        onClose: () => {
          console.log("Payment cancelled");
        }
      });
    }
  }, [token]);


  useEffect(() => {
    const midtransUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    let scriptTag = document.createElement("script");
    scriptTag.src = midtransUrl;
    scriptTag.setAttribute("data-client-key", "SB-Mid-client-cAFD0sSoOSoeyfA3");
    document.body.appendChild(scriptTag);

    return () => {
      document.body.removeChild(scriptTag);
    };
  }, []);

  return (
  <button onClick={pembayaran}>bayar langsung</button>
  );
};

export default OrderInformation;
