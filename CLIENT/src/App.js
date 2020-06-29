import './App.css';
import React from 'react';
import { PageHeader, Card, Row, Col, Button, Divider, Radio, Statistic, Timeline, Switch } from "antd";
import { GoogleApiWrapper, Marker, Map, Polygon } from 'google-maps-react';
import branchAndBound from './tspBranchAndBound'
const Queries = require('./Queries')


const cityLimit = 10

var google = null
var mapGoogle = null
var directionsService = null
var directionsDisplay = null

export class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loadingStart: false,
      showPolygon: false,
      showRoute: false,
      travelMode: 'DRIVING',
      costDist: null,
      costDur: null,
      markers: [],
      stgLatLng: [],
      objLatLng: [],
      matrixDist: [],
      matrixDur: [],
      arrayMinRoute: [],
      route: []
    };
    this.startMaps = this.startMaps.bind(this);
  }

  clear() {
    this.setState({ costDist: null })
    this.setState({ costDur: null })
    this.setState({ markers: [] })
    this.setState({ stgLatLng: [] })
    this.setState({ objLatLng: [] })
    this.setState({ matrixDist: [] })
    this.setState({ matrixDur: [] })
    this.setState({ arrayMinRoute: [] })
    this.setState({ route: [] })
    directionsDisplay.setMap(null);
    directionsDisplay.setDirections(null);
  }

  clearBeforeStart() {
    directionsDisplay.setMap(null);
    directionsDisplay.setDirections(null);
    this.setState({ route: [] })
    this.setState({ costDist: null })
    this.setState({ costDur: null })

  }

  async gooogleMapsDistanceMatrix(stgLatLng) {
    //This function responds with a distances matrix between inserted markers 
    let response = await Queries.getMatrixDistance(this.state.travelMode, stgLatLng)
    if (response) {
      if (response.data.status === 'OK') {
        //Declare emptys matrices
        let matrixDistance = [];
        let matrixDuration = [];
        for (let i = 0; i < stgLatLng.length; i++) {
          matrixDistance[i] = new Array(stgLatLng.length);
          matrixDuration[i] = new Array(stgLatLng.length);
        }
        //Get elements from response an copy then to appropriate matrix
        for (let i = 0; i < stgLatLng.length; i++) {
          for (let j = 0; j < stgLatLng.length; j++) {
            if (response.data.rows[0].elements[j].status == 'OK' && response.data.rows[i].elements[j].distance != undefined) {
              let distance = response.data.rows[i].elements[j].distance.value;
              let duration = response.data.rows[i].elements[j].duration.value;
              if (distance == 0 || duration == 0) {
                matrixDistance[i][j] = Infinity;
                matrixDuration[i][j] = Infinity;
              } else {
                matrixDistance[i][j] = distance;
                matrixDuration[i][j] = duration;
              }
            } else {
              return ({
                status: false,
                erro: 'Não há rotas para alguma das localizações'
              })
            }
          }
        }
        //Return of Promisse
        return ({
          status: true,
          matrixDistance, matrixDuration
        })
      } else {
        return ({
          status: false,
          erro: 'Ocorreu um erro'
        })
      }
    } else {
      return ({
        status: false,
        erro: 'Error'
      })
    }

  }

  insertMaker(coord) {
    //Clean the map if user aready calculate a route previously
    if (this.state.arrayMinRoute.length > 0) {
      this.clear()
    }
    if (this.state.markers.length < cityLimit) {
      const { latLng } = coord;
      const lat = latLng.lat();
      const lng = latLng.lng();
      const stgPlaces = `${lat},${lng}`
      const objPlaces = { lat: lat, lng: lng }

      //Set Markers Matrix
      this.setState(previousState => {
        return {
          markers: [
            ...previousState.markers,
            {
              title: this.state.markers.length.toString(),
              name: null,
              position: { lat, lng }
            }
          ]
        };
      });

      //Set String Lat Lng Matrix (used in Google Matrix API)
      this.setState(previousState => {
        return {
          stgLatLng: [
            ...previousState.stgLatLng, stgPlaces
          ]
        };
      });

      //Set Object Lat Lng Matrix (used in Google Route API)
      this.setState(previousState => {
        return {
          objLatLng: [
            ...previousState.objLatLng, objPlaces
          ]
        };
      });

    } else {
      alert('Limite de cidades atingido!')
      return null
    }

  }

  async start(method) {
    this.setState({ loadingStart: true })

    //Clean previusly routes, cost, etc
    this.clearBeforeStart()

    //Get MatrixDistance and Duration
    this.gooogleMapsDistanceMatrix(this.state.stgLatLng).then(async (response) => {
      if (response.status) {
        this.setState({ matrixDist: response.matrixDistance })
        this.setState({ matrixDur: response.matrixDuration })

        if (method === 'distance') {
          //CALL ALGORITHM BRANCH AND BOUND return min path and lowest cost(meters)
          let arrayMinRoute = branchAndBound.tspBranchAndBound(this.state.matrixDist)
          this.setState({ arrayMinRoute: arrayMinRoute })
          this.setState({ costDist: `${arrayMinRoute[arrayMinRoute.length - 1].cost / 1000} km` })

        } else {
          //CALL ALGORITHM BRANCH AND BOUND return min path and lowest cost (seconds)
          let arrayMinRoute = branchAndBound.tspBranchAndBound(this.state.matrixDur)
          this.setState({ arrayMinRoute: arrayMinRoute })
          //Pretty formmatter before set Cost
          let seconds = arrayMinRoute[arrayMinRoute.length - 1].cost
          let h = Math.floor(seconds / 3600);
          let m = Math.floor(seconds % 3600 / 60);
          this.setState({ costDur: `${h} Horas ${m} minutos` })
        }

        //console.log('Rota TSP Branch and Bound', this.state.arrayMinRoute)

        //Make the match get index off min travel and search on matrix o boj lat lng
        this.state.arrayMinRoute.map((obj) => {
          let index = obj.index;
          this.setState(previousState => {
            return {
              route: [
                ...previousState.route, this.state.objLatLng[index]
              ]
            };
          });
        })

        let waypts = [];
        for (let i = 0; i < this.state.route.length; i++) {
          waypts.push({
            location: this.state.route[i],
            stopover: false
          });
        }

        if (this.state.showRoute) {
          directionsDisplay.setMap(mapGoogle)
        }


        let request = {
          origin: this.state.route[0],
          destination: this.state.route[0],
          waypoints: waypts,
          travelMode: this.state.travelMode === 'DRIVING' ? google.maps.TravelMode.DRIVING :
            this.state.travelMode === 'BICYCLING' ? google.maps.TravelMode.BICYCLING :
              this.state.travelMode === 'WALKING' ? google.maps.TravelMode.WALKING :
                google.maps.TravelMode.DRIVING
          ,
          avoidTolls: false
        };

        new Promise((resolve) => {
          directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              directionsDisplay.setDirections(response);

              let costDist = 0
              let costDur = 0
              for (let i = 0; i < response.routes[0].legs.length; i++) {
                costDist += response.routes[0].legs[i].distance.value;
                costDur += response.routes[0].legs[i].duration.value;
              }
              resolve({ costDist, costDur })
            }
          });
        }).then((response) => {
          if (method === 'distance') {
            let d = response.costDur
            let h = Math.floor(d / 3600);
            let m = Math.floor(d % 3600 / 60);
            this.setState({ costDur: `${h} Horas ${m} minutos*` })
          } else {
            this.setState({ costDist: `${response.costDist / 1000} km*` })
          }

          this.setState({ loadingStart: false })
        })
      } else {
        alert(response.erro);
        this.setState({ loadingStart: false })
        this.clear()
      }

    })

  }

  isRoute() {
    if (this.state.showRoute) {
      this.setState({ showRoute: false })
      directionsDisplay.setMap(null)

    } else {
      if (this.state.route.length > 0) {        
        directionsDisplay.setMap(mapGoogle)
      }
      this.setState({ showRoute: true })

    }
  }

  travelMode(value) {
    this.setState({ travelMode: value })

  }

  startMaps(mapProps, map) {
    mapGoogle = map
    google = mapProps.google;
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

  }

  componentDidMount() {
  }

  render() {
    return (
      <div>
        <Row gutter={[1000, 12]}>
          <Col className="gutter-row" span={24}>
            <PageHeader title="Caixeiro Viajante Branch and Bound" subTitle="CIC111" />
          </Col>
          <Col className="gutter-row" span={24}>
            <div style={{ width: 500, height: 500 }}>
              <Map
                google={this.props.google}
                className={'map-canvas'}
                zoom={10}
                initialCenter={{
                  lat: -22.4097429,
                  lng: -45.4613914
                }}
                streetViewControl={false}
                mapTypeControl={false}
                onClick={(t, map, coord) => this.insertMaker(coord)}
                onReady={(mapProps, map) => this.startMaps(mapProps, map)}
              >
                {this.state.showPolygon ?
                  <Polygon
                    paths={this.state.route}
                    strokeColor="#FF0000"
                    strokeOpacity={1}
                    strokeWeight={2}
                    fillOpacity={0} />
                  : null}
                {this.state.markers.map((marker, index) => (
                  <Marker
                    key={index}
                    label={index.toString()}
                    title={marker.title}
                    name={marker.name}
                    position={marker.position}

                  >
                  </Marker>
                ))}
              </Map>
            </div>
          </Col>
        </Row>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ paddingLeft: '5%', paddingRight: '5%', paddingTop: '1%', paddingBottom: '1%' }}>
          <Col className="gutter-row" span={8} >
            <Statistic title="Número de Cidades" value={this.state.stgLatLng.length > 0 ? this.state.stgLatLng.length : 0} />
          </Col>
          <Col className="gutter-row" span={8}>
            <Statistic title="Duração" value={this.state.costDur ? this.state.costDur : 'Não calculada'} />
          </Col>
          <Col className="gutter-row" span={8}>
            <Statistic title="Distância" value={this.state.costDist ? this.state.costDist : 'Não calculada'} />
          </Col>
        </Row>
        <Divider orientation="left" style={{ color: '#333', fontWeight: 'normal' }} />
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ paddingLeft: '5%', paddingRight: '5%' }}>
          <Col className="gutter-row" span={10}>
            <Button onClick={() => this.start('distance')} type="primary" loading={this.state.loadingStart}>Calcular pela Distância Mínima</Button>
          </Col>
          <Col className="gutter-row" span={10}>
            <Button onClick={() => this.start('duration')} type="primary" loading={this.state.loadingStart}>Calcular pela Duração Mínima</Button>
          </Col>
          <Col className="gutter-row" span={4}>
            <Button onClick={() => this.clear()}>Limpar</Button>
          </Col>
        </Row>
        <Divider orientation="left" style={{ color: '#333', fontWeight: 'normal' }} />
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} style={{ paddingLeft: '5%', paddingRight: '5%', paddingTop: '1%', paddingBottom: '1%' }}>
          <Col className="configuracoes" span={12}>
            <Card title="Configurações" >
              <Row gutter={[16, 24]}>
                <Col className="ispoligono" span={12}>
                  <Switch checkedChildren="Polígono" unCheckedChildren="Polígono" onChange={() => this.state.showPolygon ? this.setState({ showPolygon: false }) : this.setState({ showPolygon: true })} />
                </Col>
              </Row>
              <Row gutter={[16, 24]}>
                <Col className="isrota" span={12}>
                  <Switch checkedChildren="Rota" unCheckedChildren="Rota" onChange={() => this.isRoute()} />
                </Col>
              </Row><Row gutter={[16, 24]}>
                <Col className="travelmode" span={12}>
                  <Radio.Group onChange={(e) => this.travelMode(e.target.value)} defaultValue={'DRIVING'}>
                    <Radio value={'DRIVING'} style={{ display: 'block', lineHeight: '30px' }}>Dirigindo</Radio>
                    <Radio value={'BICYCLING'} style={{ display: 'block', lineHeight: '30px' }}>Pedalando</Radio>
                    <Radio value={'WALKING'} style={{ display: 'block', lineHeight: '30px' }}>Andando</Radio>
                  </Radio.Group>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col className="caminho-minimo" span={12}>
            <Card title="Caminho mínimo">
              <Timeline>
                {this.state.arrayMinRoute.map((obj) => (
                  <Timeline.Item key={obj.index + 1}>{obj.index}</Timeline.Item>
                ))
                }
                <Timeline.Item key={0}>0</Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>
      </div >
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_MAPS_ID
})(App);
