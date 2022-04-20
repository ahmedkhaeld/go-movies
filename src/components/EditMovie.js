import React, { Component, Fragment } from "react";
import "./EditMovie.css";
import Input from './form-components/Input';
import TextArea from './form-components/TextArea';
import Select from './form-components/Select';
import Alert from './ui-components/Alert';
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default class EditMovie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            movie: {
                id: 0,
                title: "",
                release_date: "",
                runtime: "",
                mpaa_rating: "",
                rating: "",
                description: "",
            },
            mpaaOptions: [
                {id: "G", value: "G"},
                {id: "PG", value: "PG"},
                {id: "PG13", value: "PG13"},
                {id: "R", value: "R"},
                {id: "NC17", value: "NC17"},
            ],
            isLoaded: false,
            error: null,
            errors : [],
            alert : {
                type: "d-none",
                message: "",
            }
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit = (evt) => {
        evt.preventDefault();
        // client side validation
        let errors = [];
        if (this.state.movie.title=== ""){
            errors.push("title");
        }
        if (this.state.movie.release_date=== ""){
            errors.push("release_date");
        }
        if (this.state.movie.runtime=== ""){
            errors.push("runtime");
        }
        if (this.state.movie.rating=== ""){
            errors.push("rating");
        }
        if (this.state.movie.description=== ""){
            errors.push("description");
        }
        this.setState({errors: errors});

        if (errors.length > 0){
            return false;
        }

        // grape tha data from the form
        const data =new FormData(evt.target);
        // convert to payload
        const payload =Object.fromEntries(data.entries());
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", "Bearer " + this.props.jwt);

        // write the request to POST the payload
        const requestOptions ={
            method: 'POST',
            body: JSON.stringify(payload),
            headers: myHeaders
        }
        // fetch the payload data
        fetch('http://localhost:4000/v1/admin/editmovie', requestOptions)
            .then(response => response.json())
            .then(data=>{
              if (data.error){
                  this.setState({
                      alert: {type: "alert-danger", message: data.error.message},
                  });
              }else{
                  // after save clicked -> direct usr to admin
                  this.props.history.push({
                      pathname: "/admin",
                  });
              }
        })

    };

    handleChange = (evt) => {
        let value = evt.target.value;
        let name = evt.target.name;
        this.setState((prevState) => ({
            movie: {
                ...prevState.movie,
                [name]: value,
            }
        }))
    };

    // check if found an error for the key, return the index of it in the  errors array
    hasError(key){
        return this.state.errors.indexOf(key) !== -1;
    }


    componentDidMount() {
        if (this.props.jwt === "") {
            this.props.history.push({
                pathname: "/login",
            });
            return;
        }


        // check the id,if id gt zero then go get the movie from the db

        const id = this.props.match.params.id;
        if (id > 0) {
            fetch("http://localhost:4000/v1/movie/" + id)
                .then((response) => {
                    if (response.status !== "200") {
                        let err = Error;
                        err.Message = "Invalid response code: " + response.status;
                        this.setState({ error: err });
                    }
                    return response.json();
                })
                .then((json) => {
                    const releaseDate = new Date(json.movie.release_date);

                    this.setState(
                        {
                            movie: {
                                id: id,
                                title: json.movie.title,
                                release_date: releaseDate.toISOString().split("T")[0],
                                runtime: json.movie.runtime,
                                mpaa_rating: json.movie.mpaa_rating,
                                rating: json.movie.rating,
                                description: json.movie.description,
                            },
                            isLoaded: true,
                        },
                        (error) => {
                            this.setState({
                                isLoaded: true,
                                error,
                            });
                        }
                    );
                });
        } else {
            this.setState({ isLoaded: true });
        }
    }

    confirmDelete = (e) => {
        confirmAlert({
            title: "Delete Movie?",
            message: "Are you sure?",
            buttons: [
                {
                    label: "Yes",
                    onClick: () => {
                        // delete the movie
                        const myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        myHeaders.append("Authorization", "Bearer " + this.props.jwt);
                        fetch(
                            "http://localhost:4000/v1/admin/deletemovie/" +
                            this.state.movie.id,
                            {
                                method: "GET",
                                headers: myHeaders,
                            }
                        )
                            .then((response) => response.json)
                            .then((data) => {
                                if (data.error) {
                                    this.setState({
                                        alert: {
                                            type: "alert-danger",
                                            message: data.error.message,
                                        },
                                    });
                                } else {
                                    this.setState({
                                        alert: { type: "alert-success", message: "Movie deleted!" },
                                    });
                                    this.props.history.push({
                                        pathname: "/admin",
                                    });
                                }
                            });
                    },
                },
                {
                    label: "No",
                    onClick: () => {},
                },
            ],
        });
    };


    render() {
        let { movie, isLoaded, error } = this.state;

        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <p>Loading...</p>;
        } else {
            return (
                <Fragment>
                    <h2>Add/Edit Movie</h2>
                    <Alert
                        alertType={this.state.alert.type}
                        alertMessage={this.state.alert.message}
                    />
                    <hr/>
                    <form onSubmit={this.handleSubmit}>
                        <input
                            type="hidden"
                            name="id"
                            id="id"
                            value={movie.id}
                            onChange={this.handleChange}
                        />
                        <Input
                            title={"Title"}
                            className={this.hasError("title") ? "is-invalid" : ""}
                            type={'text'}
                            name={'title'}
                            value={movie.title}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("title") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a title"}
                        />

                        <Input
                            title={"Release Date"}
                            type={'date'}
                            name={'release_date'}
                            value={movie.release_date}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("release_date") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a release date"}

                        />


                        <Input
                            title={"Runtime"}
                            type={'text'}
                            name={'runtime'}
                            value={movie.runtime}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("runtime") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a release runtime"}
                        />


                        <Input
                            title={"Rating"}
                            type={'text'}
                            name={'rating'}
                            value={movie.rating}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("rating") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a rating"}
                        />

                        <Select
                            title={'MPAA Rating'}
                            name={'mpaa_rating'}
                            options={this.state.mpaaOptions}
                            value={movie.mpaa_rating}
                            handleChange={this.handleChange}
                            placeholder={'Choose...'}
                        />


                        <TextArea
                            title={"Description"}
                            name={"description"}
                            value={movie.description}
                            rows={"3"}
                            handleChange={this.handleChange}
                            errorDiv={this.hasError("description") ? "text-danger" : "d-none"}
                            errorMsg={"Pleas enter a description"}

                        />
                        <hr/>

                        <button className="btn btn-primary">Save</button>
                        <Link to="/admin" className="btn btn-warning ms-1">
                            Cancel
                        </Link>
                        {movie.id > 0 && (
                            <a href="#!" onClick={() => this.confirmDelete()}
                               className="btn btn-danger ms-1">
                                Delete
                            </a>
                            )}
                    </form>

                </Fragment>
            );
        }
    }
}